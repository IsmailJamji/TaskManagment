import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database-unified.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const projetSchema = Joi.object({
  nom: Joi.string().required(),
  description: Joi.string().allow(''),
  chef_projet_id: Joi.number().integer().required(),
  date_debut: Joi.date().required(),
  date_fin_prevue: Joi.date().required(),
  statut: Joi.string().valid('planifie', 'en_cours', 'suspendu', 'termine', 'annule').default('planifie'),
  priorite: Joi.string().valid('low', 'medium', 'high').default('medium'),
  budget: Joi.number().min(0).allow(null),
  equipe_ids: Joi.array().items(Joi.number().integer()).default([])
});

const sousTacheSchema = Joi.object({
  projet_id: Joi.number().integer().required(),
  nom: Joi.string().required(),
  description: Joi.string().allow(''),
  assigne_id: Joi.number().integer().required(),
  date_debut: Joi.date().required(),
  date_fin_prevue: Joi.date().required(),
  statut: Joi.string().valid('not_started', 'in_progress', 'completed', 'blocked').default('not_started'),
  priorite: Joi.string().valid('low', 'medium', 'high').default('medium'),
  progression: Joi.number().min(0).max(100).default(0)
});

// Get all projects
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    let query = `
      SELECT p.*, u.name as chef_projet_name
      FROM projets p
      LEFT JOIN users u ON p.chef_projet_id = u.id
    `;
    
    let params: any[] = [];
    
    if (req.user.role !== 'admin') {
      // Users can see projects where they are team members or project manager
      query += ` WHERE p.chef_projet_id = $1 OR p.id IN (
        SELECT projet_id FROM projet_equipes WHERE user_id = $1
      )`;
      params = [req.user.id];
    }
    
    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    
    // Get team members for each project
    for (let project of result.rows) {
      const teamResult = await pool.query(`
        SELECT u.id, u.name
        FROM projet_equipes pe
        JOIN users u ON pe.user_id = u.id
        WHERE pe.projet_id = $1
      `, [project.id]);
      
      project.equipe_names = teamResult.rows.map(member => member.name);
      project.equipe_ids = teamResult.rows.map(member => member.id);
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's projects (where user is project manager or team member)
router.get('/user', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT p.*, u.name as chef_projet_name
      FROM projets p
      LEFT JOIN users u ON p.chef_projet_id = u.id
      WHERE p.chef_projet_id = $1 
         OR p.id IN (
           SELECT projet_id FROM projet_equipes WHERE user_id = $1
         )
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    let query = `
      SELECT p.*, u.name as chef_projet_name
      FROM projets p
      LEFT JOIN users u ON p.chef_projet_id = u.id
      WHERE p.id = $1
    `;
    
    let params = [id];
    
    if (req.user.role !== 'admin') {
      query += ` AND (p.chef_projet_id = $2 OR p.id IN (
        SELECT projet_id FROM projet_equipes WHERE user_id = $2
      ))`;
      params.push(req.user.id);
    }

    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = result.rows[0];
    
    // Get team members
    const teamResult = await pool.query(`
      SELECT u.id, u.name
      FROM projet_equipes pe
      JOIN users u ON pe.user_id = u.id
      WHERE pe.projet_id = $1
    `, [id]);
    
    project.equipe_names = teamResult.rows.map(member => member.name);
    project.equipe_ids = teamResult.rows.map(member => member.id);

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create project
router.post('/', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { error, value } = projetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nom, description, chef_projet_id, date_debut, date_fin_prevue, statut, priorite, budget, equipe_ids } = value;


    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create project
      const projectResult = await client.query(`
        INSERT INTO projets (nom, description, chef_projet_id, date_debut, date_fin_prevue, statut, priorite, budget)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [nom, description, chef_projet_id, date_debut, date_fin_prevue, statut, priorite, budget]);

      const project = projectResult.rows[0];

      // Add team members
      if (equipe_ids && equipe_ids.length > 0) {
        for (const userId of equipe_ids) {
          await client.query(`
            INSERT INTO projet_equipes (projet_id, user_id)
            VALUES ($1, $2)
          `, [project.id, userId]);
        }
      }

      await client.query('COMMIT');

      // Get project with team members
      const teamResult = await pool.query(`
        SELECT u.id, u.name
        FROM projet_equipes pe
        JOIN users u ON pe.user_id = u.id
        WHERE pe.projet_id = $1
      `, [project.id]);
      
      project.equipe_names = teamResult.rows.map(member => member.name);
      project.equipe_ids = teamResult.rows.map(member => member.id);

      res.status(201).json(project);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
router.put('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const { error, value } = projetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nom, description, chef_projet_id, date_debut, date_fin_prevue, statut, priorite, budget, equipe_ids } = value;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update project
      const projectResult = await client.query(`
        UPDATE projets 
        SET nom = $1, description = $2, chef_projet_id = $3, date_debut = $4, 
            date_fin_prevue = $5, statut = $6, priorite = $7, budget = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
      `, [nom, description, chef_projet_id, date_debut, date_fin_prevue, statut, priorite, budget, id]);

      if (projectResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Project not found' });
      }

      // Update team members
      await client.query('DELETE FROM projet_equipes WHERE projet_id = $1', [id]);
      
      if (equipe_ids && equipe_ids.length > 0) {
        for (const userId of equipe_ids) {
          await client.query(`
            INSERT INTO projet_equipes (projet_id, user_id)
            VALUES ($1, $2)
          `, [id, userId]);
        }
      }

      await client.query('COMMIT');

      const project = projectResult.rows[0];
      
      // Get team members
      const teamResult = await pool.query(`
        SELECT u.id, u.name
        FROM projet_equipes pe
        JOIN users u ON pe.user_id = u.id
        WHERE pe.projet_id = $1
      `, [id]);
      
      project.equipe_names = teamResult.rows.map(member => member.name);
      project.equipe_ids = teamResult.rows.map(member => member.id);

      res.json(project);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM projets WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project subtasks
router.get('/:id/sous-taches', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    // Check if user has access to this project
    let accessQuery = 'SELECT id FROM projets WHERE id = $1';
    let accessParams = [id];
    
    if (req.user.role !== 'admin') {
      accessQuery += ` AND (chef_projet_id = $2 OR id IN (
        SELECT projet_id FROM projet_equipes WHERE user_id = $2
      ))`;
      accessParams.push(req.user.id);
    }

    const accessResult = await pool.query(accessQuery, accessParams);
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const result = await pool.query(`
      SELECT st.*, u.name as assigne_name
      FROM sous_taches st
      LEFT JOIN users u ON st.assigne_id = u.id
      WHERE st.projet_id = $1
      ORDER BY st.created_at DESC
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get project subtasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create subtask
router.post('/:id/sous-taches', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    // Check if user has access to this project
    let accessQuery = 'SELECT id FROM projets WHERE id = $1';
    let accessParams = [id];
    
    if (req.user.role !== 'admin') {
      accessQuery += ` AND (chef_projet_id = $2 OR id IN (
        SELECT projet_id FROM projet_equipes WHERE user_id = $2
      ))`;
      accessParams.push(req.user.id);
    }

    const accessResult = await pool.query(accessQuery, accessParams);
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { error, value } = sousTacheSchema.validate({ ...req.body, projet_id: parseInt(id) });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nom, description, assigne_id, date_debut, date_fin_prevue, statut, priorite, progression } = value;

    const result = await pool.query(`
      INSERT INTO sous_taches (projet_id, nom, description, assigne_id, date_debut, date_fin_prevue, statut, priorite, progression)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [id, nom, description, assigne_id, date_debut, date_fin_prevue, statut, priorite, progression]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update subtask
router.put('/sous-taches/:subtaskId', authenticateToken, async (req: any, res) => {
  try {
    const { subtaskId } = req.params;
    
    // Check if user can edit this subtask
    const subtaskCheck = await pool.query(`
      SELECT st.*, p.chef_projet_id
      FROM sous_taches st
      JOIN projets p ON st.projet_id = p.id
      WHERE st.id = $1
    `, [subtaskId]);

    if (subtaskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    const subtask = subtaskCheck.rows[0];
    
    // Users can only edit subtasks assigned to them or if they are project manager
    if (req.user.role !== 'admin' && subtask.assigne_id !== req.user.id && subtask.chef_projet_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error, value } = sousTacheSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nom, description, assigne_id, date_debut, date_fin_prevue, statut, priorite, progression } = value;

    const result = await pool.query(`
      UPDATE sous_taches 
      SET nom = $1, description = $2, assigne_id = $3, date_debut = $4, 
          date_fin_prevue = $5, statut = $6, priorite = $7, progression = $8,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [nom, description, assigne_id, date_debut, date_fin_prevue, statut, priorite, progression, subtaskId]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete subtask
router.delete('/sous-taches/:subtaskId', authenticateToken, async (req: any, res) => {
  try {
    const { subtaskId } = req.params;
    
    // Check if user can delete this subtask
    const subtaskCheck = await pool.query(`
      SELECT st.*, p.chef_projet_id
      FROM sous_taches st
      JOIN projets p ON st.projet_id = p.id
      WHERE st.id = $1
    `, [subtaskId]);

    if (subtaskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    const subtask = subtaskCheck.rows[0];
    
    // Only admin or project manager can delete subtasks
    if (req.user.role !== 'admin' && subtask.chef_projet_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query('DELETE FROM sous_taches WHERE id = $1 RETURNING *', [subtaskId]);
    
    res.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error('Delete subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
