import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database-unified.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const parcTelecomSchema = Joi.object({
  numero_puce: Joi.string().allow(''),
  operateur: Joi.string().valid('iam', 'inwi').required(),
  proprietaire: Joi.string().required(),
  ville_societe: Joi.string().allow(''),
  poste: Joi.string().allow(''),
  departement: Joi.string().allow(''),
  specifications: Joi.object({
    type_abonnement: Joi.string().allow(''),
    
    forfait: Joi.string().allow(''),
    date_activation: Joi.string().allow(''),
    type: Joi.string().allow(''),
    autres: Joi.string().allow('')
  }).default({})
});

// Get all parc telecom items
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    let query = `
      SELECT pt.*
      FROM parc_telecom pt
    `;
    
    let params: any[] = [];
    
    query += ' ORDER BY pt.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get parc telecom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single parc telecom item
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    let query = `
      SELECT pt.*
      FROM parc_telecom pt
      WHERE pt.id = $1
    `;
    
    let params = [id];

    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get parc telecom item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create parc telecom item
router.post('/', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { error, value } = parcTelecomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { numero_puce, operateur, proprietaire, ville_societe, poste, departement, specifications } = value;

    const result = await pool.query(`
      INSERT INTO parc_telecom (numero_puce, operateur, proprietaire, ville_societe, poste, departement, specifications)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [numero_puce || null, operateur, proprietaire, ville_societe || null, poste || null, departement || null, JSON.stringify(specifications)]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create parc telecom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update parc telecom item
router.put('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const { error, value } = parcTelecomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { numero_puce, operateur, proprietaire, ville_societe, poste, departement, specifications } = value;

    const result = await pool.query(`
      UPDATE parc_telecom 
      SET numero_puce = $1, operateur = $2, proprietaire = $3, 
          ville_societe = $4, poste = $5, departement = $6, specifications = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [numero_puce || null, operateur, proprietaire, ville_societe || null, poste || null, departement || null, JSON.stringify(specifications), id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update parc telecom error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Numéro de puce already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete parc telecom item
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM parc_telecom WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete parc telecom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



export default router;
