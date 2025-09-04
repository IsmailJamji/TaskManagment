import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  assignee_id: Joi.number().integer().required(),
  due_date: Joi.date().required(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  status: Joi.string().valid('not_started', 'in_progress', 'completed').default('not_started')
});

// Get all tasks (admin) or user's tasks (user)
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    let query = `
      SELECT t.*, 
             u1.name as assignee_name, 
             u2.name as assigner_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assignee_id = u1.id
      LEFT JOIN users u2 ON t.assigner_id = u2.id
    `;
    
    let params: any[] = [];
    
    if (req.user.role !== 'admin') {
      query += ' WHERE t.assignee_id = $1';
      params = [req.user.id];
    }
    
    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create task (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { title, description, assignee_id, due_date, priority, status } = value;

    const result = await pool.query(`
      INSERT INTO tasks (title, description, assignee_id, assigner_id, due_date, priority, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [title, description, assignee_id, req.user.id, due_date, priority, status]);

    const created = result.rows[0];
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, entity, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'create', 'task', created.id, { title, assignee_id, due_date, priority, status }]
    );
    res.status(201).json(created);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const taskId = req.params.id;
    
    // Check if user can edit this task
    const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskCheck.rows[0];
    
    // Users can only edit their assigned tasks and only status/comments
    if (req.user.role !== 'admin' && task.assignee_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let updateFields = [];
    let params = [];
    let paramCount = 1;

    if (req.user.role === 'admin') {
      // Admin can update all fields
      if (req.body.title) {
        updateFields.push(`title = $${paramCount++}`);
        params.push(req.body.title);
      }
      if (req.body.description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        params.push(req.body.description);
      }
      if (req.body.assignee_id) {
        updateFields.push(`assignee_id = $${paramCount++}`);
        params.push(req.body.assignee_id);
      }
      if (req.body.due_date) {
        updateFields.push(`due_date = $${paramCount++}`);
        params.push(req.body.due_date);
      }
      if (req.body.priority) {
        updateFields.push(`priority = $${paramCount++}`);
        params.push(req.body.priority);
      }
    }

    // Both admin and user can update status
    if (req.body.status) {
      updateFields.push(`status = $${paramCount++}`);
      params.push(req.body.status);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(taskId);

    const query = `
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    const updated = result.rows[0];
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, entity, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'update', 'task', updated.id, req.body]
    );
    res.json(updated);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await pool.query(
      `INSERT INTO activity_logs (user_id, action, entity, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'delete', 'task', req.params.id]
    );
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;