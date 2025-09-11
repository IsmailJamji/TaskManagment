import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database-unified.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const parcInformatiqueSchema = Joi.object({
  type: Joi.string().valid('laptop', 'desktop', 'monitor', 'printer', 'other').required(),
  marque: Joi.string().required(),
  modele: Joi.string().allow(''),
  serial_number: Joi.string().allow(''),
  proprietaire: Joi.string().required(),
  departement: Joi.string().allow(''),
  ville_societe: Joi.string().allow(''),
  poste: Joi.string().allow(''),
  est_premiere_main: Joi.boolean().default(true),
  date_acquisition: Joi.date().required(),
  ticket_numero: Joi.string().allow(''),
  specifications: Joi.object({
    processeur: Joi.string().allow(''),
    ram: Joi.string().allow(''),
    disque_dur: Joi.string().allow(''),
    os: Joi.string().allow(''),
    autres: Joi.string().allow('')
  }).default({}),
  equipements_supplementaires: Joi.object().default({})
});

// Get all parc informatique items
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    let query = `
      SELECT pi.*,
             EXTRACT(YEAR FROM AGE(CURRENT_DATE, pi.date_acquisition)) as age_ans,
             CASE 
               WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, pi.date_acquisition)) > 5 THEN true 
               ELSE false 
             END as est_ancien
      FROM parc_informatique pi
    `;
    
    let params: any[] = [];
    let paramCount = 0;
    const whereConditions: string[] = [];

    // Search filter
    const { search, type, ancien, os, ram, disque } = req.query;
    
    if (search) {
      paramCount++;
      whereConditions.push(`(
        pi.marque ILIKE $${paramCount} OR 
        pi.proprietaire ILIKE $${paramCount} OR 
        pi.modele ILIKE $${paramCount} OR
        pi.serial_number ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
    }

    // Type filter
    if (type && type !== 'all') {
      paramCount++;
      whereConditions.push(`pi.type = $${paramCount}`);
      params.push(type);
    }

    // Age filter
    if (ancien === 'true') {
      whereConditions.push(`EXTRACT(YEAR FROM AGE(CURRENT_DATE, pi.date_acquisition)) > 5`);
    } else if (ancien === 'false') {
      whereConditions.push(`EXTRACT(YEAR FROM AGE(CURRENT_DATE, pi.date_acquisition)) <= 5`);
    }

    // OS filter
    if (os && os !== 'all') {
      paramCount++;
      whereConditions.push(`pi.specifications->>'os' ILIKE $${paramCount}`);
      params.push(`%${os}%`);
    }

    // RAM filter
    if (ram && ram !== 'all') {
      paramCount++;
      whereConditions.push(`pi.specifications->>'ram' ILIKE $${paramCount}`);
      params.push(`%${ram}%`);
    }

    // Disque filter
    if (disque && disque !== 'all') {
      paramCount++;
      whereConditions.push(`pi.specifications->>'disque_dur' ILIKE $${paramCount}`);
      params.push(`%${disque}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    query += ` ${whereClause} ORDER BY pi.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get parc informatique error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single parc informatique item
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    let query = `
      SELECT pi.*,
             EXTRACT(YEAR FROM AGE(CURRENT_DATE, pi.date_acquisition)) as age_ans,
             CASE 
               WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, pi.date_acquisition)) > 5 THEN true 
               ELSE false 
             END as est_ancien
      FROM parc_informatique pi
      WHERE pi.id = $1
    `;
    
    let params = [id];

    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get parc informatique item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create parc informatique item
router.post('/', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { error, value } = parcInformatiqueSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { 
      type, marque, modele, serial_number, proprietaire, departement, 
      ville_societe, poste, est_premiere_main, date_acquisition, 
      ticket_numero, specifications, equipements_supplementaires 
    } = value;

    const result = await pool.query(`
      INSERT INTO parc_informatique (
        type, marque, modele, serial_number, proprietaire, departement, 
        ville_societe, poste, est_premiere_main, date_acquisition, 
        ticket_numero, specifications, equipements_supplementaires
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      type, marque, modele || null, serial_number || null, proprietaire, 
      departement || null, ville_societe || null, poste || null, 
      est_premiere_main, date_acquisition, ticket_numero || null, 
      JSON.stringify(specifications), JSON.stringify(equipements_supplementaires)
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create parc informatique error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update parc informatique item
router.put('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const { error, value } = parcInformatiqueSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { 
      type, marque, modele, serial_number, proprietaire, departement, 
      ville_societe, poste, est_premiere_main, date_acquisition, 
      ticket_numero, specifications, equipements_supplementaires 
    } = value;

    const result = await pool.query(`
      UPDATE parc_informatique 
      SET type = $1, marque = $2, modele = $3, serial_number = $4, 
          proprietaire = $5, departement = $6, ville_societe = $7, 
          poste = $8, est_premiere_main = $9, date_acquisition = $10, 
          ticket_numero = $11, specifications = $12, 
          equipements_supplementaires = $13, updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `, [
      type, marque, modele || null, serial_number || null, proprietaire, 
      departement || null, ville_societe || null, poste || null, 
      est_premiere_main, date_acquisition, ticket_numero || null, 
      JSON.stringify(specifications), JSON.stringify(equipements_supplementaires), id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update parc informatique error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete parc informatique item
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM parc_informatique WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete parc informatique error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
