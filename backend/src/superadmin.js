const bcrypt = require('bcrypt');
const db = require('./db');

async function initSuperadmin() {
  try {
    const username = (process.env.SUPERADMIN_USERNAME || 'superadmin').toLowerCase().trim();
    const email = (process.env.SUPERADMIN_EMAIL || 'superadmin@algouniversity.com').toLowerCase().trim();
    const password = process.env.SUPERADMIN_PASSWORD || 'superadminpassword123';

    // Check if super admin already exists
    const superadminRes = await db.query(
      "SELECT id FROM users WHERE role = 'superadmin' OR LOWER(username) = $1 OR LOWER(email) = $2",
      [username, email]
    );

    if (superadminRes.rows.length === 0) {
      console.log('No superadmin account found. Creating one...');
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      await db.query(
        `INSERT INTO users (name, email, username, password_hash, role, profile_completed)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Super Admin', email, username, passwordHash, 'superadmin', true]
      );
      console.log(`Superadmin account successfully created with username: @${username}`);
    } else {
      console.log('Superadmin account verified/already exists.');
    }
  } catch (error) {
    console.error('Error initializing superadmin account:', error);
  }
}

module.exports = initSuperadmin;
