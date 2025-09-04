import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const commentSchema = Joi.object({
  comment_text: Joi.string().required()
});

// Get comments for a task
router.get('/task/:taskId', authenticateToken, async (req: any, res) => {
  try {
    const taskId = req.params.taskId;

    // Check if user can access this task
    const taskCheck = await pool.query(`
      SELECT id FROM tasks 
      WHERE id = $1 AND (assignee_id = $2 OR $3 = 'admin')
    `, [taskId, req.user.id, req.user.role]);

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    const result = await pool.query(`
      SELECT c.*, u.name as user_name 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.task_id = $1
      ORDER BY c.created_at ASC
    `, [taskId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment to task
router.post('/task/:taskId', authenticateToken, async (req: any, res) => {
  try {
    const taskId = req.params.taskId;
    
    const { error, value } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user can access this task
    const taskCheck = await pool.query(`
      SELECT id FROM tasks 
      WHERE id = $1 AND (assignee_id = $2 OR $3 = 'admin')
    `, [taskId, req.user.id, req.user.role]);

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    const result = await pool.query(`
      INSERT INTO comments (task_id, user_id, comment_text)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [taskId, req.user.id, value.comment_text]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;