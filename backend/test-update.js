const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

async function runDiagnose() {
  try {
    await client.connect();
    console.log("Connected to database:", process.env.DB_NAME);

    // Get table schema
    const schemaRes = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    console.log("Schema columns:");
    schemaRes.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type} (${r.character_maximum_length})`));

    // Get the first user ID
    const userRes = await client.query(`SELECT id FROM users LIMIT 1`);
    if (userRes.rows.length === 0) {
      console.log("No users in DB");
      return;
    }
    const userId = userRes.rows[0].id;

    // Test the update query
    const updateQuery = `
      UPDATE users
      SET 
        secondary_email = $1,
        website_url = $2,
        twitter_handle = $3,
        street_address = $4,
        city = $5,
        postal_code = $6,
        edu_institution = $7,
        edu_degree = $8,
        edu_start_year = $9,
        edu_end_year = $10,
        edu_location = $11,
        avatar_url = $12,
        linkedin_url = $13,
        profile_completed = TRUE
      WHERE id = $14
      RETURNING id;
    `;
    
    console.log("Running test update on user", userId);
    await client.query(updateQuery, [
      'test@example.com',
      'http://test.com',
      'test',
      '123 test st',
      'Test City',
      '12345',
      'Test Uni',
      'BS',
      2020,
      2024,
      'Test Loc',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'http://linkedin.com/test',
      userId
    ]);
    console.log("Update successful!");

  } catch (err) {
    console.error("Test failed with error:", err.message);
  } finally {
    await client.end();
  }
}

runDiagnose();
