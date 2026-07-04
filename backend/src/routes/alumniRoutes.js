const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth guard to all alumni directory routes
router.use(authenticateToken);

// Get all alumni with optional search & filter parameters
router.get('/', async (req, res) => {
  const { search, batch } = req.query;

  try {
    let queryText = `
      SELECT id, name, email, username, role, linkedin_url, graduation_year, company, position, bio, avatar_url, created_at
      FROM users
      WHERE role = 'alumni'
    `;
    const params = [];

    // Search query: filters by name, company, or position
    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (name ILIKE $${params.length} OR company ILIKE $${params.length} OR position ILIKE $${params.length})`;
    }

    // Batch query: filters by graduation year
    if (batch && batch.trim() !== '') {
      params.push(parseInt(batch));
      queryText += ` AND graduation_year = $${params.length}`;
    }

    queryText += ' ORDER BY name ASC;';

    const result = await db.query(queryText, params);
    res.status(200).json({ alumni: result.rows });
  } catch (error) {
    console.error('Fetch alumni directory error:', error);
    res.status(500).json({ message: 'Internal server error while fetching alumni directory.' });
  }
});

// Get a single alumni's public profile details
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const queryText = `
      SELECT id, name, email, username, role, linkedin_url, graduation_year, company, position, bio, avatar_url, created_at
      FROM users
      WHERE id = $1;
    `;
    const result = await db.query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Alumni not found.' });
    }

    res.status(200).json({ alumni: result.rows[0] });
  } catch (error) {
    console.error('Fetch alumni profile error:', error);
    res.status(500).json({ message: 'Internal server error while fetching alumni profile.' });
  }
});

// Complete profile wizard handler
router.put('/profile/complete', async (req, res) => {
  const userId = req.user.id;
  const {
    secondary_email,
    website_url,
    twitter_handle,
    street_address,
    city,
    postal_code,
    edu_institution,
    edu_degree,
    edu_start_year,
    edu_end_year,
    edu_location,
    avatar_url,
    linkedin_url
  } = req.body;

  try {
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
        graduation_year = $10,
        edu_location = $11,
        avatar_url = $12,
        linkedin_url = $13,
        profile_completed = TRUE
      WHERE id = $14
      RETURNING id, name, email, role, linkedin_url, graduation_year, company, position, bio, avatar_url, 
                secondary_email, website_url, twitter_handle, street_address, city, postal_code, 
                edu_institution, edu_degree, edu_start_year, edu_end_year, edu_location, profile_completed, created_at;
    `;

    const result = await db.query(updateQuery, [
      secondary_email || null,
      website_url || null,
      twitter_handle || null,
      street_address || null,
      city || null,
      postal_code || null,
      edu_institution || null,
      edu_degree || null,
      edu_start_year ? parseInt(edu_start_year) : null,
      edu_end_year ? parseInt(edu_end_year) : null,
      edu_location || null,
      avatar_url || null,
      linkedin_url || null,
      userId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Profile completed successfully!',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: 'Internal server error while completing profile.' });
  }
});

module.exports = router;

