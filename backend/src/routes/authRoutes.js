const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// User Registration Route
router.post('/register', async (req, res) => {
  const { name, email, username, password, linkedin_url, graduation_year, company, position, bio, avatar_url, role } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({ message: 'Name, email, username, and password are required.' });
  }

  try {
    // Check if user already exists by email
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Check if user already exists by username
    const existingUsername = await db.query('SELECT * FROM users WHERE LOWER(username) = $1', [username.toLowerCase().trim()]);
    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ message: 'Username is already taken. Please choose another one.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Determine role: limit to alumni and algouniversity, defaulting to alumni.
    const userRole = (role === 'algouniversity') ? 'algouniversity' : 'alumni';

    // Insert user into DB
    const insertQuery = `
      INSERT INTO users (name, email, username, password_hash, role, linkedin_url, graduation_year, company, position, bio, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, email, username, role, linkedin_url, graduation_year, company, position, bio, avatar_url, profile_completed, created_at;
    `;

    const result = await db.query(insertQuery, [
      name.trim(),
      email.toLowerCase().trim(),
      username.toLowerCase().trim(),
      passwordHash,
      userRole,
      linkedin_url || null,
      graduation_year ? parseInt(graduation_year) : null,
      company || null,
      position || null,
      bio || null,
      avatar_url || null
    ]);

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      process.env.JWT_SECRET || 'supersecretkeyforalumniportal',
      { expiresIn: '7d' }
    );

    // Store JWT in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Registration successful!',
      user: newUser,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

// User Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email/Username and password are required.' });
  }

  try {
    const loginUser = email.toLowerCase().trim();
    // Check if user exists
    const result = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1',
      [loginUser]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email/username or password.' });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'supersecretkeyforalumniportal',
      { expiresIn: '7d' }
    );

    // Store JWT in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove password hash from response
    delete user.password_hash;

    res.status(200).json({
      message: 'Login successful!',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// Get Current User Profile (Token Check)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, username, role, linkedin_url, graduation_year, company, position, bio, avatar_url, secondary_email, website_url, twitter_handle, street_address, city, postal_code, edu_institution, edu_degree, edu_start_year, edu_end_year, edu_location, profile_completed, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Logout Route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully.' });
});

module.exports = router;
