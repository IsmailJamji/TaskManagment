import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database-unified.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const updateSousTacheSchema = Joi.object({
  statut: Joi.string().valid('not_started', 'in_progress', 'completed', 'blocked').optional(),
  progression: Joi.number().min(0).max(100).optional()
});

// Get user's subtasks (where user is assigned to)
router.get('/user', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(`
      SELECT st.*, u.name as assigne_name, p.nom as projet_nom
      FROM sous_taches st
      LEFT JOIN users u ON st.assigne_id = u.id
      LEFT JOIN projets p ON st.projet_id = p.id
      WHERE st.assigne_id = $1
      ORDER BY st.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get user subtasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user's subtask (only status and progression)
router.put('/user/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate input
    const { error, value } = updateSousTacheSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if subtask exists and is assigned to the user
    const checkResult = await pool.query(
      'SELECT id FROM sous_taches WHERE id = $1 AND assigne_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sous-tâche non trouvée ou non assignée à vous' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (value.statut !== undefined) {
      paramCount++;
      updates.push(`statut = $${paramCount}`);
      values.push(value.statut);
    }

    if (value.progression !== undefined) {
      paramCount++;
      updates.push(`progression = $${paramCount}`);
      values.push(value.progression);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add id for WHERE clause
    paramCount++;
    values.push(id);

    const query = `
      UPDATE sous_taches 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
