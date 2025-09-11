import express from 'express';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { pool } from '../config/database-unified.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'user').default('user'),
  is_active: Joi.boolean().optional(),
  department: Joi.string().optional()
});

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, is_active, department, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, role, is_active, department } = value;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, is_active, department)
      VALUES ($1, $2, $3, $4, COALESCE($5, true), $6)
      RETURNING id, name, email, role, is_active, department, created_at
    `, [name, email, hashedPassword, role, is_active, department]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role, is_active, department } = req.body;

    // Prevent admin from deactivating themselves
    if (req.user.id == userId && is_active === false) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    let updateFields = [];
    let params = [];
    let paramCount = 1;

    if (name) {
      updateFields.push(`name = $${paramCount++}`);
      params.push(name);
    }
    if (email) {
      updateFields.push(`email = $${paramCount++}`);
      params.push(email);
    }
    if (role) {
      updateFields.push(`role = $${paramCount++}`);
      params.push(role);
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      params.push(is_active);
    }
    if (department !== undefined) {
      updateFields.push(`department = $${paramCount++}`);
      params.push(department);
    }

    // Handle password update if provided
    if (req.body.password) {
      const hashed = await bcrypt.hash(req.body.password, 10);
      updateFields.push(`password_hash = $${paramCount++}`);
      params.push(hashed);
    }

    params.push(userId);

    const result = await pool.query(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, is_active, department, created_at
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
 
// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  const client = await pool.connect();
  try {
    const userId = parseInt(req.params.id);

    // Prevent admin from deleting themselves
    if (req.user.id === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await client.query('BEGIN');

    // Nullify references to this user to avoid FK violations
    await client.query('UPDATE tasks SET assignee_id = NULL WHERE assignee_id = $1', [userId]);
    await client.query('UPDATE tasks SET assigner_id = NULL WHERE assigner_id = $1', [userId]);
    await client.query('UPDATE comments SET user_id = NULL WHERE user_id = $1', [userId]);

    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    await client.query('COMMIT');
    return res.json({ message: 'User deleted' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Reset user password (admin only)
const passwordSchema = Joi.object({ password: Joi.string().min(6).required() });

router.put('/:id/password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = passwordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.params.id;
    const hashed = await bcrypt.hash(value.password, 10);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, name, email, role, is_active, department, created_at',
      [hashed, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});