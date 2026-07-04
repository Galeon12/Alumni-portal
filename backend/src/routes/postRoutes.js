const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Get all approved posts (with author details, likes/comments count, and is_liked indicators)
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const queryText = `
      SELECT p.id, p.title, p.content, p.image_url, p.status, p.created_at, p.author_id,
             u.name as author_name, u.role as author_role, u.company as author_company, u.position as author_position, u.graduation_year as author_graduation_year,
             (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
             (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comment_count,
             EXISTS (SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1) as is_liked,
             COALESCE(
               (SELECT json_agg(json_build_object('id', pl.user_id, 'name', lu.name, 'role', lu.role, 'company', lu.company, 'position', lu.position, 'graduation_year', lu.graduation_year, 'avatar_url', lu.avatar_url))
                FROM post_likes pl
                JOIN users lu ON pl.user_id = lu.id
                WHERE pl.post_id = p.id),
               '[]'::json
             ) as likers
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.status = 'approved'
      ORDER BY p.created_at DESC;
    `;
    const result = await db.query(queryText, [userId]);
    res.status(200).json({ posts: result.rows });
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ message: 'Internal server error while fetching posts.' });
  }
});

// Submit a new post (requires auth)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  const author_id = req.user.id;
  const author_role = req.user.role;

  let image_url = null;
  if (req.file) {
    image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  }

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  try {
    // If creator is admin, auto-approve the post. Otherwise, set status to 'pending'.
    const initialStatus = (author_role === 'admin' || author_role === 'superadmin') ? 'approved' : 'pending';

    const insertQuery = `
      INSERT INTO posts (title, content, image_url, author_id, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, content, image_url, author_id, status, created_at;
    `;

    const result = await db.query(insertQuery, [
      title.trim(),
      content.trim(),
      image_url || null,
      author_id,
      initialStatus
    ]);

    const newPost = result.rows[0];

    res.status(201).json({
      message: initialStatus === 'approved' ? 'Post published successfully!' : 'Post submitted. Waiting for admin approval.',
      post: newPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Internal server error while creating post.' });
  }
});

// Edit an existing post (only author can edit)
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  try {
    // Check if post exists
    const postRes = await db.query('SELECT author_id FROM posts WHERE id = $1', [id]);
    if (postRes.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const post = postRes.rows[0];
    if (post.author_id !== userId) {
      return res.status(403).json({ message: 'You are not authorized to edit this post.' });
    }

    let image_url = null;
    let updateQuery;
    let params;

    // Reset status to pending for alumni edits to undergo review again
    const newStatus = (userRole === 'admin' || userRole === 'superadmin') ? 'approved' : 'pending';

    if (req.file) {
      image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      updateQuery = `
        UPDATE posts 
        SET title = $1, content = $2, image_url = $3, status = $4
        WHERE id = $5
        RETURNING *;
      `;
      params = [title.trim(), content.trim(), image_url, newStatus, id];
    } else {
      updateQuery = `
        UPDATE posts 
        SET title = $1, content = $2, status = $3
        WHERE id = $4
        RETURNING *;
      `;
      params = [title.trim(), content.trim(), newStatus, id];
    }

    const result = await db.query(updateQuery, params);
    
    res.status(200).json({
      message: newStatus === 'approved' ? 'Post updated successfully!' : 'Post updated and sent for admin approval.',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Internal server error while updating post.' });
  }
});

// Delete a post (author or admin can delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Check if post exists
    const postRes = await db.query('SELECT author_id FROM posts WHERE id = $1', [id]);
    if (postRes.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const post = postRes.rows[0];
    
    // Verify authority
    if (post.author_id !== userId && userRole !== 'admin' && userRole !== 'superadmin') {
      return res.status(403).json({ message: 'You are not authorized to delete this post.' });
    }

    await db.query('DELETE FROM posts WHERE id = $1', [id]);

    res.status(200).json({ message: 'Post deleted successfully!' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Internal server error while deleting post.' });
  }
});

// Toggle like status on a post
router.post('/:id/like', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    // Check if post exists
    const postRes = await db.query('SELECT * FROM posts WHERE id = $1', [postId]);
    if (postRes.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check if user already liked the post
    const likeRes = await db.query('SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
    
    let isLiked = false;
    if (likeRes.rows.length > 0) {
      // User liked, so unlike it
      await db.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
      isLiked = false;
    } else {
      // User hasn't liked, so like it
      await db.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
      isLiked = true;
    }

    // Get updated like count
    const countRes = await db.query('SELECT COUNT(*) FROM post_likes WHERE post_id = $1', [postId]);
    const likeCount = parseInt(countRes.rows[0].count);

    res.status(200).json({
      message: isLiked ? 'Post liked' : 'Post unliked',
      is_liked: isLiked,
      like_count: likeCount
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Internal server error while toggling like.' });
  }
});

// Get list of users who liked a post
router.get('/:id/likes', authenticateToken, async (req, res) => {
  const postId = req.params.id;

  try {
    const query = `
      SELECT u.id, u.name, u.role, u.company, u.position, u.graduation_year, u.avatar_url
      FROM post_likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.post_id = $1
      ORDER BY l.created_at DESC;
    `;
    const result = await db.query(query, [postId]);
    res.status(200).json({ likers: result.rows });
  } catch (error) {
    console.error('Fetch likers error:', error);
    res.status(500).json({ message: 'Internal server error while fetching post likers.' });
  }
});

// Add a comment to a post
router.post('/:id/comments', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Comment content cannot be empty.' });
  }

  try {
    // Check if post exists
    const postRes = await db.query('SELECT * FROM posts WHERE id = $1', [postId]);
    if (postRes.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const insertQuery = `
      INSERT INTO post_comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, created_at;
    `;
    const result = await db.query(insertQuery, [postId, userId, content.trim()]);
    const newComment = result.rows[0];

    // Get commenter's user info
    const userRes = await db.query(
      'SELECT name, role, company, position, graduation_year, avatar_url FROM users WHERE id = $1',
      [userId]
    );

    res.status(201).json({
      message: 'Comment added successfully.',
      comment: {
        ...newComment,
        user_name: userRes.rows[0].name,
        user_role: userRes.rows[0].role,
        user_company: userRes.rows[0].company,
        user_position: userRes.rows[0].position,
        user_graduation_year: userRes.rows[0].graduation_year,
        user_avatar_url: userRes.rows[0].avatar_url
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Internal server error while adding comment.' });
  }
});

// Get all comments for a post
router.get('/:id/comments', authenticateToken, async (req, res) => {
  const postId = req.params.id;

  try {
    const query = `
      SELECT c.id, c.content, c.created_at, c.user_id,
             u.name as user_name, u.role as user_role, u.company as user_company, u.position as user_position, u.graduation_year as user_graduation_year, u.avatar_url as user_avatar_url
      FROM post_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC;
    `;
    const result = await db.query(query, [postId]);
    res.status(200).json({ comments: result.rows });
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ message: 'Internal server error while fetching post comments.' });
  }
});

module.exports = router;
