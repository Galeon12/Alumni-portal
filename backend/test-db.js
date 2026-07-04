const { Client } = require('pg');
require('dotenv').config();

console.log("=== Database Connection & Schema Test ===");
console.log("Configured Database Credentials in .env:");
console.log("User:     ", process.env.DB_USER);
console.log("Host:     ", process.env.DB_HOST);
console.log("Database: ", process.env.DB_NAME);
console.log("Port:     ", process.env.DB_PORT);
console.log("Password: ", process.env.DB_PASSWORD);

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'postgres', // connect to default to list databases
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

async function checkDatabase(dbName) {
  const testClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: dbName,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  });

  try {
    await testClient.connect();
    const res = await testClient.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    const exists = res.rows[0].exists;
    console.log(`Database '${dbName}': 'users' table exists? ${exists}`);
    
    if (exists) {
      // also check columns
      const cols = await testClient.query(`
        SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
      `);
      console.log(`Columns in '${dbName}.users':`, cols.rows.map(r => r.column_name).join(', '));
    }
  } catch (err) {
    console.error(`Error checking '${dbName}':`, err.message);
  } finally {
    await testClient.end();
  }
}

async function runTest() {
  console.log("\nScanning databases for 'users' table...");
  await checkDatabase('postgres');
  await checkDatabase('algouniversity_admin');
}

runTest();
