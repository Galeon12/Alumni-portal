const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Apply auth middleware to all event routes
router.use(authenticateToken);

// Get all approved events (with host name, attendee count, and is_attending indicator)
router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    const queryText = `
      SELECT e.id, e.title, e.description, e.date_time, e.location, e.image_url, e.creator_id, e.status, e.created_at,
             u.name as creator_name,
             (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id) as attendee_count,
             EXISTS (SELECT 1 FROM event_attendees WHERE event_id = e.id AND user_id = $1) as is_attending
      FROM events e
      JOIN users u ON e.creator_id = u.id
      WHERE e.status = 'approved'
      ORDER BY e.date_time ASC;
    `;
    const result = await db.query(queryText, [userId]);
    res.status(200).json({ events: result.rows });
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ message: 'Internal server error while fetching events.' });
  }
});

// Get detailed view of single event + list of attendee profiles
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // 1. Fetch Event Info
    const eventQuery = `
      SELECT e.id, e.title, e.description, e.date_time, e.location, e.image_url, e.creator_id, e.status, e.created_at,
             u.name as creator_name,
             (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id) as attendee_count,
             EXISTS (SELECT 1 FROM event_attendees WHERE event_id = e.id AND user_id = $1) as is_attending
      FROM events e
      JOIN users u ON e.creator_id = u.id
      WHERE e.id = $2;
    `;
    const eventResult = await db.query(eventQuery, [userId, id]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const eventDetails = eventResult.rows[0];

    // 2. Fetch Attendees List
    const attendeesQuery = `
      SELECT u.id, u.name, u.company, u.position, u.graduation_year, u.avatar_url
      FROM event_attendees ea
      JOIN users u ON ea.user_id = u.id
      WHERE ea.event_id = $1
      ORDER BY u.name ASC;
    `;
    const attendeesResult = await db.query(attendeesQuery, [id]);

    res.status(200).json({
      event: eventDetails,
      attendees: attendeesResult.rows
    });
  } catch (error) {
    console.error('Fetch event detail error:', error);
    res.status(500).json({ message: 'Internal server error while fetching event details.', error: error.stack || String(error) });
  }
});

// Create an event (approved if admin, pending if alumni)
router.post('/', upload.single('image'), async (req, res) => {
  const { title, description, date_time, location } = req.body;
  const creatorId = req.user.id;
  const role = req.user.role;

  let image_url = null;
  if (req.file) {
    image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  }

  if (!title || !description || !date_time || !location) {
    return res.status(400).json({ message: 'Title, description, date/time, and location are required.' });
  }

  try {
    const initialStatus = (role === 'admin' || role === 'superadmin') ? 'approved' : 'pending';

    const insertQuery = `
      INSERT INTO events (title, description, date_time, location, image_url, creator_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, description, date_time, location, image_url, creator_id, status, created_at;
    `;

    const result = await db.query(insertQuery, [
      title.trim(),
      description.trim(),
      date_time,
      location.trim(),
      image_url || null,
      creatorId,
      initialStatus
    ]);

    const newEvent = result.rows[0];

    // If approved and creator is not admin, automatically RSVP the creator
    if (initialStatus === 'approved' && role !== 'admin' && role !== 'superadmin') {
      await db.query(
        'INSERT INTO event_attendees (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [newEvent.id, creatorId]
      );
    }

    // Trigger notifications for all other users since event goes live immediately
    if (initialStatus === 'approved') {
      const creatorName = req.user.name || 'Admin';
      const notificationMessage = `New Event: "${newEvent.title}" has been posted by ${creatorName}`;
      
      const usersRes = await db.query(
        "SELECT id FROM users WHERE id != $1", 
        [creatorId]
      );
      if (usersRes.rows.length > 0) {
        const notifValues = [];
        const queryParams = [];
        usersRes.rows.forEach((targetUser, index) => {
          const baseIndex = index * 3;
          notifValues.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`);
          queryParams.push(targetUser.id, newEvent.id, notificationMessage);
        });
        const insertNotificationsQuery = `
          INSERT INTO notifications (user_id, event_id, message)
          VALUES ${notifValues.join(', ')}
        `;
        await db.query(insertNotificationsQuery, queryParams);
      }
    }

    res.status(201).json({
      message: initialStatus === 'approved' ? 'Event published successfully!' : 'Event submitted. Waiting for admin approval.',
      event: newEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Internal server error while creating event.' });
  }
});

// Toggle RSVP status for the authenticated user
router.post('/:id/rsvp', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if event exists and is approved
    const eventCheck = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = eventCheck.rows[0];
    if (event.status !== 'approved') {
      return res.status(403).json({ message: 'Cannot RSVP to an unapproved event.' });
    }
    
    if (new Date(event.date_time) < new Date()) {
      return res.status(403).json({ message: 'Cannot RSVP to an event that has already ended.' });
    }

    // Check existing RSVP
    const rsvpCheck = await db.query(
      'SELECT 1 FROM event_attendees WHERE event_id = $1 AND user_id = $2',
      [id, userId]
    );

    let attending = false;

    if (rsvpCheck.rows.length > 0) {
      // User is already attending, remove RSVP
      await db.query('DELETE FROM event_attendees WHERE event_id = $1 AND user_id = $2', [id, userId]);
      attending = false;
    } else {
      // Add RSVP
      await db.query('INSERT INTO event_attendees (event_id, user_id) VALUES ($1, $2)', [id, userId]);
      attending = true;
    }

    res.status(200).json({
      message: attending ? 'You are going to this event!' : 'RSVP cancelled successfully.',
      is_attending: attending
    });
  } catch (error) {
    console.error('RSVP toggle error:', error);
    res.status(500).json({ message: 'Internal server error while updating RSVP.' });
  }
});

// Edit an existing event (only creator can edit)
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, description, location, date_time } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!title || !description || !location || !date_time) {
    return res.status(400).json({ message: 'Title, description, location, and date_time are required.' });
  }

  try {
    // Check if event exists
    const eventRes = await db.query('SELECT creator_id FROM events WHERE id = $1', [id]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = eventRes.rows[0];
    if (event.creator_id !== userId) {
      return res.status(403).json({ message: 'You are not authorized to edit this event.' });
    }

    let image_url = null;
    let updateQuery;
    let params;

    // Reset status to pending for alumni edits to undergo review again
    const newStatus = (userRole === 'admin' || userRole === 'superadmin') ? 'approved' : 'pending';

    if (req.file) {
      image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      updateQuery = `
        UPDATE events 
        SET title = $1, description = $2, location = $3, date_time = $4, image_url = $5, status = $6
        WHERE id = $7
        RETURNING *;
      `;
      params = [title.trim(), description.trim(), location.trim(), date_time, image_url, newStatus, id];
    } else {
      updateQuery = `
        UPDATE events 
        SET title = $1, description = $2, location = $3, date_time = $4, status = $5
        WHERE id = $6
        RETURNING *;
      `;
      params = [title.trim(), description.trim(), location.trim(), date_time, newStatus, id];
    }

    const result = await db.query(updateQuery, params);
    
    res.status(200).json({
      message: newStatus === 'approved' ? 'Event updated successfully!' : 'Event updated and sent for admin approval.',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Internal server error while updating event.' });
  }
});

// Delete an event (creator or admin can delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Check if event exists
    const eventRes = await db.query('SELECT creator_id FROM events WHERE id = $1', [id]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = eventRes.rows[0];
    
    // Verify authority: creator or admin
    if (event.creator_id !== userId && userRole !== 'admin' && userRole !== 'superadmin') {
      return res.status(403).json({ message: 'You are not authorized to delete this event.' });
    }

    await db.query('DELETE FROM events WHERE id = $1', [id]);

    res.status(200).json({ message: 'Event deleted successfully!' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Internal server error while deleting event.' });
  }
});

module.exports = router;
