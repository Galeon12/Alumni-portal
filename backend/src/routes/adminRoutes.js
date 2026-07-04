const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth & admin guards to all routes in this router
router.use(authenticateToken, requireAdmin);

// Get count of pending approvals for indicator dot
router.get('/pending-status', async (req, res) => {
  try {
    const postsRes = await db.query("SELECT COUNT(*) FROM posts WHERE status = 'pending'");
    const eventsRes = await db.query("SELECT COUNT(*) FROM events WHERE status = 'pending'");
    
    const pendingPostsCount = parseInt(postsRes.rows[0].count);
    const pendingEventsCount = parseInt(eventsRes.rows[0].count);
    
    res.status(200).json({
      hasPending: pendingPostsCount > 0 || pendingEventsCount > 0,
      pendingPostsCount,
      pendingEventsCount
    });
  } catch (error) {
    console.error('Pending status check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all pending posts
router.get('/posts/pending', async (req, res) => {
  try {
    const queryText = `
      SELECT p.id, p.title, p.content, p.image_url, p.status, p.created_at,
             u.name as author_name, u.email as author_email, u.company as author_company, u.position as author_position
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at ASC;
    `;
    const result = await db.query(queryText);
    res.status(200).json({ posts: result.rows });
  } catch (error) {
    console.error('Fetch pending posts error:', error);
    res.status(500).json({ message: 'Internal server error while fetching pending posts.' });
  }
});

// Approve a post
router.post('/posts/:id/approve', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "UPDATE posts SET status = 'approved' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    res.status(200).json({
      message: 'Post approved successfully!',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Approve post error:', error);
    res.status(500).json({ message: 'Internal server error while approving post.' });
  }
});

// Reject (or delete/reject status) a post
router.post('/posts/:id/reject', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "UPDATE posts SET status = 'rejected' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    res.status(200).json({
      message: 'Post rejected successfully.',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Reject post error:', error);
    res.status(500).json({ message: 'Internal server error while rejecting post.' });
  }
});

// Get all pending events
router.get('/events/pending', async (req, res) => {
  try {
    const queryText = `
      SELECT e.id, e.title, e.description, e.date_time, e.location, e.image_url, e.status, e.created_at,
             u.name as creator_name, u.email as creator_email, u.company as creator_company, u.position as creator_position
      FROM events e
      JOIN users u ON e.creator_id = u.id
      WHERE e.status = 'pending'
      ORDER BY e.date_time ASC;
    `;
    const result = await db.query(queryText);
    res.status(200).json({ events: result.rows });
  } catch (error) {
    console.error('Fetch pending events error:', error);
    res.status(500).json({ message: 'Internal server error while fetching pending events.' });
  }
});

// Approve an event
router.post('/events/:id/approve', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "UPDATE events SET status = 'approved' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = result.rows[0];

    // Fetch creator details
    const creatorRes = await db.query('SELECT name, role FROM users WHERE id = $1', [event.creator_id]);
    const creatorRole = creatorRes.rows[0]?.role;
    const creatorName = creatorRes.rows[0]?.name || 'Alumni';

    if (creatorRole !== 'admin' && creatorRole !== 'superadmin') {
      // Automatically RSVP the creator to the approved event
      await db.query(
        'INSERT INTO event_attendees (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [event.id, event.creator_id]
      );
    }

    // Trigger notifications for all other users since event is approved and published
    const notificationMessage = `New Event: "${event.title}" has been posted by ${creatorName}`;
    const usersRes = await db.query(
      "SELECT id FROM users WHERE id != $1", 
      [event.creator_id]
    );
    if (usersRes.rows.length > 0) {
      const notifValues = [];
      const queryParams = [];
      usersRes.rows.forEach((targetUser, index) => {
        const baseIndex = index * 3;
        notifValues.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`);
        queryParams.push(targetUser.id, event.id, notificationMessage);
      });
      const insertNotificationsQuery = `
        INSERT INTO notifications (user_id, event_id, message)
        VALUES ${notifValues.join(', ')}
      `;
      await db.query(insertNotificationsQuery, queryParams);
    }

    res.status(200).json({
      message: 'Event approved and published!',
      event
    });
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({ message: 'Internal server error while approving event.' });
  }
});

// Reject an event
router.post('/events/:id/reject', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "UPDATE events SET status = 'rejected' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.status(200).json({
      message: 'Event request rejected.',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Reject event error:', error);
    res.status(500).json({ message: 'Internal server error while rejecting event.' });
  }
});

// Promote a user to admin (only superadmin can do this)
router.post('/promote-admin', async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Only Super Admin can promote users to admin.' });
  }

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Username is required.' });
  }

  try {
    const userRes = await db.query(
      'SELECT id, username, role FROM users WHERE LOWER(username) = $1',
      [username.toLowerCase().trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const targetUser = userRes.rows[0];

    if (targetUser.role === 'superadmin') {
      return res.status(400).json({ message: 'User is already a Super Admin.' });
    }
    if (targetUser.role === 'admin') {
      return res.status(400).json({ message: 'User is already an Admin.' });
    }

    await db.query(
      "UPDATE users SET role = 'admin' WHERE id = $1",
      [targetUser.id]
    );

    res.status(200).json({
      message: `User @${targetUser.username} has been successfully promoted to Admin!`
    });
  } catch (error) {
    console.error('Promote admin error:', error);
    res.status(500).json({ message: 'Internal server error while promoting user.' });
  }
});

// Get all registered admins (only superadmin can do this)
router.get('/admins', async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Only Super Admin can view the admins list.' });
  }

  try {
    const result = await db.query(
      "SELECT id, name, email, username, role, company, position, graduation_year, avatar_url FROM users WHERE role = 'admin' ORDER BY name ASC"
    );
    res.status(200).json({ admins: result.rows });
  } catch (error) {
    console.error('Fetch admins list error:', error);
    res.status(500).json({ message: 'Internal server error while fetching admins.' });
  }
});

// Revoke admin access (only superadmin can do this)
router.post('/revoke-admin', async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Only Super Admin can revoke admin access.' });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const userRes = await db.query(
      'SELECT id, username, email, role FROM users WHERE id = $1',
      [id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const targetUser = userRes.rows[0];

    if (targetUser.role === 'superadmin') {
      return res.status(400).json({ message: 'Cannot revoke access from Super Admin.' });
    }
    if (targetUser.role !== 'admin') {
      return res.status(400).json({ message: 'User is not an Admin.' });
    }

    // Heuristically set role: if email ends with @algouniversity.com, make it algouniversity, else alumni
    const emailStr = targetUser.email.toLowerCase();
    const newRole = emailStr.endsWith('@algouniversity.com') ? 'algouniversity' : 'alumni';

    await db.query(
      "UPDATE users SET role = $1 WHERE id = $2",
      [newRole, targetUser.id]
    );

    res.status(200).json({
      message: `Admin access has been successfully revoked from @${targetUser.username || targetUser.email}! Their role is now set to ${newRole}.`
    });
  } catch (error) {
    console.error('Revoke admin error:', error);
    res.status(500).json({ message: 'Internal server error while revoking admin access.' });
  }
});

module.exports = router;
