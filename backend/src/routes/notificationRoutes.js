const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication to all notification endpoints
router.use(authenticateToken);

// Get all notifications for the authenticated user
router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
      SELECT n.id, n.event_id, n.message, n.is_read, n.created_at,
             e.location AS event_location
      FROM notifications n
      LEFT JOIN events e ON n.event_id = e.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC;
    `;
    const result = await db.query(query, [userId]);
    res.status(200).json({ notifications: result.rows });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Internal server error while fetching notifications.' });
  }
});

// Mark a single notification as read
router.put('/:id/read', async (req, res) => {
  const notifId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [notifId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found or access denied.' });
    }

    res.status(200).json({ message: 'Notification marked as read.', notification: result.rows[0] });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Internal server error while marking notification as read.' });
  }
});

module.exports = router;
