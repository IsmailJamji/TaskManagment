import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database-unified.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const parcInformatiqueSchema = Joi.object({
  type: Joi.string().valid('laptop', 'desktop', 'unite_centrale', 'clavier', 'imprimante', 'telephone', 'routeur', 'serveur', 'souris', 'ecran', 'casque', 'autre').required(),
  marque: Joi.string().required(),
  modele: Joi.string().allow(''),
  serial_number: Joi.string().allow(''),
  ticket_numero: Joi.string().allow(''),
  specifications: Joi.object({
    disque_dur: Joi.string().allow(''),
    processeur: Joi.string().allow(''),
    ram: Joi.string().allow(''),
    os: Joi.string().allow(''),
    autres: Joi.string().allow('')
  }).default({}),
  equipements_supplementaires: Joi.object({
    clavier: Joi.boolean().default(false),
    souris: Joi.boolean().default(false),
    ecran: Joi.boolean().default(false),
    casque: Joi.boolean().default(false)
  }).default({}),
  proprietaire: Joi.string().required(),
  ville_societe: Joi.string().allow(''),
  poste: Joi.string().allow(''),
  departement: Joi.string().allow(''),
  est_premiere_main: Joi.boolean().default(true),
  date_acquisition: Joi.date().required()
});

// Get all parc informatique items with pagination
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const type = req.query.type || '';
    const ancien = req.query.ancien || '';
    const os = req.query.os || '';
    const ram = req.query.ram || '';
    const disque = req.query.disque || '';
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';
    
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let params: any[] = [];
    let paramCount = 0;
    
    // Search filter
    if (search) {
      paramCount++;
      whereConditions.push(`(
        pi.marque ILIKE $${paramCount} OR 
        pi.modele ILIKE $${paramCount} OR 
        pi.serial_number ILIKE $${paramCount} OR 
        pi.proprietaire ILIKE $${paramCount} OR 
        pi.departement ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
    }
    
    // Type filter
    if (type) {
      paramCount++;
      whereConditions.push(`pi.type = $${paramCount}`);
      params.push(type);
    }
    
    // Ancien filter
    if (ancien === 'true') {
      whereConditions.push(`pi.est_ancien = true`);
    } else if (ancien === 'false') {
      whereConditions.push(`pi.est_ancien = false`);
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
    
    // Get total count
    const countQuery = `SELECT COUNT(*) FROM parc_informatique pi ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);
    
    // Get items
    const query = `
      SELECT pi.*,
             EXTRACT(YEAR FROM AGE(CURRENT_DATE, pi.date_acquisition)) as age_ans,
             CASE 
               WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, pi.date_acquisition)) > 5 THEN true 
               ELSE false 
             END as est_ancien
      FROM parc_informatique pi
      ${whereClause}
      ORDER BY pi.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    const queryParams = [...params, limit, offset];
    const result = await pool.query(query, queryParams);
    
    res.json({
      items: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get parc informatique error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single parc informatique item
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT pi.*,
             EXTRACT(YEAR FROM AGE(CURRENT_DATE, pi.date_acquisition)) as age_ans,
             CASE 
               WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, pi.date_acquisition)) > 5 THEN true 
               ELSE false 
             END as est_ancien
      FROM parc_informatique pi
      WHERE pi.id = $1
    `, [id]);
    
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

    const { type, marque, modele, serial_number, ticket_numero, specifications, equipements_supplementaires, proprietaire, ville_societe, poste, departement, est_premiere_main, date_acquisition } = value;


    // Essayer d'abord avec equipements_supplementaires
    let result;
    try {
      result = await pool.query(`
        INSERT INTO parc_informatique (type, marque, modele, serial_number, ticket_numero, specifications, equipements_supplementaires, proprietaire, ville_societe, poste, departement, est_premiere_main, date_acquisition)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [type, marque, modele, serial_number || null, ticket_numero || null, JSON.stringify(specifications), JSON.stringify(equipements_supplementaires), proprietaire, ville_societe || null, poste || null, departement || null, est_premiere_main, date_acquisition]);
    } catch (error) {
      // Si la colonne n'existe pas, essayer sans equipements_supplementaires
      if (error.code === '42703') { // Column does not exist
        console.log('⚠️ Colonne equipements_supplementaires n\'existe pas, ajout sans ce champ');
        result = await pool.query(`
          INSERT INTO parc_informatique (type, marque, modele, serial_number, ticket_numero, specifications, proprietaire, ville_societe, poste, departement, est_premiere_main, date_acquisition)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        `, [type, marque, modele, serial_number || null, ticket_numero || null, JSON.stringify(specifications), proprietaire, ville_societe || null, poste || null, departement || null, est_premiere_main, date_acquisition]);
      } else {
        throw error;
      }
    }

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

    const { type, marque, modele, serial_number, ticket_numero, specifications, equipements_supplementaires, proprietaire, ville_societe, poste, departement, est_premiere_main, date_acquisition } = value;


    // Essayer d'abord avec equipements_supplementaires
    let result;
    try {
      result = await pool.query(`
        UPDATE parc_informatique 
        SET type = $1, marque = $2, modele = $3, serial_number = $4, ticket_numero = $5, 
            specifications = $6, equipements_supplementaires = $7, proprietaire = $8, ville_societe = $9, poste = $10, 
            departement = $11, est_premiere_main = $12, date_acquisition = $13, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $14
        RETURNING *
      `, [type, marque, modele, serial_number || null, ticket_numero || null, JSON.stringify(specifications), JSON.stringify(equipements_supplementaires), proprietaire, ville_societe || null, poste || null, departement || null, est_premiere_main, date_acquisition, id]);
    } catch (error) {
      // Si la colonne n'existe pas, essayer sans equipements_supplementaires
      if (error.code === '42703') { // Column does not exist
        console.log('⚠️ Colonne equipements_supplementaires n\'existe pas, mise à jour sans ce champ');
        result = await pool.query(`
          UPDATE parc_informatique 
          SET type = $1, marque = $2, modele = $3, serial_number = $4, ticket_numero = $5, 
              specifications = $6, proprietaire = $7, ville_societe = $8, poste = $9, 
              departement = $10, est_premiere_main = $11, date_acquisition = $12, 
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $13
          RETURNING *
        `, [type, marque, modele, serial_number || null, ticket_numero || null, JSON.stringify(specifications), proprietaire, ville_societe || null, poste || null, departement || null, est_premiere_main, date_acquisition, id]);
      } else {
        throw error;
      }
    }

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
router.delete('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM parc_informatique WHERE id = $1 RETURNING *', [id]);
    
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
