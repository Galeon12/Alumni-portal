const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Successfully connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

async function initTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        username VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        linkedin_url VARCHAR(255),
        graduation_year INTEGER,
        company VARCHAR(255),
        position VARCHAR(255),
        bio TEXT,
        avatar_url TEXT,
        secondary_email VARCHAR(255),
        website_url VARCHAR(255),
        twitter_handle VARCHAR(255),
        street_address TEXT,
        city VARCHAR(255),
        postal_code VARCHAR(50),
        edu_institution VARCHAR(255),
        edu_degree VARCHAR(255),
        edu_start_year INTEGER,
        edu_end_year INTEGER,
        edu_location VARCHAR(255),
        profile_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        content TEXT,
        image_url VARCHAR(255),
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        date_time TIMESTAMP,
        location VARCHAR(255),
        image_url VARCHAR(255),
        creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_attendees (
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (event_id, user_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id)
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    try {
      await pool.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';");
    } catch (enumErr) {
      console.warn('Could not add superadmin to user_role enum:', enumErr.message);
    }
    try {
      await pool.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'algouniversity';");
    } catch (enumErr) {
      console.warn('Could not add algouniversity to user_role enum:', enumErr.message);
    }
    try {
      await pool.query('ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;');
    } catch (alterErr) {
      console.warn('Could not alter users.avatar_url on startup (this is normal if users table is not created yet):', alterErr.message);
    }
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS secondary_email VARCHAR(255);');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS website_url VARCHAR(255);');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter_handle VARCHAR(255);');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS street_address TEXT;');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255);');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS postal_code VARCHAR(50);');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS edu_institution VARCHAR(255);');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS edu_degree VARCHAR(255);');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS edu_start_year INTEGER;');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS edu_end_year INTEGER;');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS edu_location VARCHAR(255);');
    } catch (alterErr) {
      console.warn('Could not add columns to users on startup:', alterErr.message);
    }
    console.log('Database tables post_likes, post_comments, and notifications verified/created.');
    try {
      const initSuperadmin = require('./superadmin');
      await initSuperadmin();
    } catch (superadminErr) {
      console.error('Failed to initialize superadmin account on startup:', superadminErr);
    }
  } catch (err) {
    console.error('Error creating post_likes/post_comments/notifications tables on startup:', err);
  }
}
initTables();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
