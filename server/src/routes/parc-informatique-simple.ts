// Route d'import Excel simplifiée pour la Super IA
import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database-unified.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import * as XLSX from 'xlsx';
import superAI from '../services/superAI.js';
import ultraAI from '../services/ultraAI.js';

const router = express.Router();

const parcInformatiqueSchema = Joi.object({
  type: Joi.string().valid('laptop', 'desktop', 'unite_centrale', 'clavier', 'imprimante', 'telephone', 'routeur', 'serveur', 'autre').required(),
  marque: Joi.string().required(),
  modele: Joi.string().allow(''),
  serial_number: Joi.string().allow(''),
  specifications: Joi.object({
    disque_dur: Joi.string().allow(''),
    processeur: Joi.string().allow(''),
    ram: Joi.string().allow(''),
    os: Joi.string().allow(''),
    autres: Joi.string().allow('')
  }).default({}),
  proprietaire: Joi.string().required(),
  ville_societe: Joi.string().allow(''),
  poste: Joi.string().allow(''),
  departement: Joi.string().allow(''),
  est_premiere_main: Joi.boolean().default(true),
  date_acquisition: Joi.date().required()
});

// Import from Excel with Super AI - Version simplifiée
router.post('/import/excel-simple', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    console.log('🧠 Import Excel Super IA - Version simplifiée');
    console.log('Body type:', typeof req.body);
    console.log('Body keys:', Object.keys(req.body || {}));
    
    // Vérifier si on a des données Excel dans le body
    if (!req.body || !req.body.data) {
      return res.status(400).json({ 
        error: 'No Excel data provided',
        message: 'Please send Excel data in the request body'
      });
    }

    // Créer un objet fichier simulé pour la Super IA
    const file = {
      data: Buffer.from(req.body.data, 'base64'),
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    
    // Analyse Ultra IA du fichier Excel
    const aiAnalysis = await ultraAI.analyzeExcel(file, 'informatique');
    
    if (!aiAnalysis.success) {
      return res.status(400).json({ 
        error: 'Erreur lors de l\'analyse du fichier',
        details: aiAnalysis.error 
      });
    }

    const importedItems = [];
    const errors = [];
    const warnings = [];
    const aiWarnings = [];

    // Afficher les résultats de l'analyse Ultra IA
    console.log('🧠 Ultra IA terminée:');
    console.log(`   - Niveau d'intelligence: ${aiAnalysis.intelligenceLevel}`);
    console.log(`   - Confiance globale: ${(aiAnalysis.confidence * 100).toFixed(1)}%`);
    console.log(`   - Colonnes détectées: ${Object.keys(aiAnalysis.columnMapping).length}`);
    console.log(`   - Lignes de données: ${aiAnalysis.totalRows}`);

    // Traitement des données analysées par l'IA
    for (const item of aiAnalysis.analyzedData) {
      try {
        // Vérification des champs requis
        if (!item.mappedData.marque || !item.mappedData.proprietaire) {
          errors.push(`Ligne ${item.rowIndex}: Marque et propriétaire requis`);
          continue;
        }

        // Vérification des numéros de série en double
        if (item.mappedData.serial_number) {
          const existingSerial = await pool.query(
            'SELECT id FROM parc_informatique WHERE serial_number = $1',
            [item.mappedData.serial_number]
          );
          
          if (existingSerial.rows.length > 0) {
            warnings.push(`Ligne ${item.rowIndex}: Numéro de série "${item.mappedData.serial_number}" existe déjà, ignoré`);
            continue;
          }
        }

        // Ajout des avertissements de l'Ultra IA
        if (item.warnings && item.warnings.length > 0) {
          item.warnings.forEach(warning => {
            aiWarnings.push(`Ligne ${item.rowIndex}: ${warning}`);
          });
        }

        // Ajout des transformations effectuées
        if (item.transformations && item.transformations.length > 0) {
          item.transformations.forEach(transformation => {
            aiWarnings.push(`Ligne ${item.rowIndex}: ${transformation}`);
          });
        }

        // Insertion en base de données
        const result = await pool.query(`
          INSERT INTO parc_informatique (type, marque, modele, serial_number, specifications, proprietaire, ville_societe, poste, departement, est_premiere_main, date_acquisition)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `, [
          item.mappedData.type,
          item.mappedData.marque,
          item.mappedData.modele || null,
          item.mappedData.serial_number || null,
          JSON.stringify(item.mappedData.specifications || {}),
          item.mappedData.proprietaire,
          item.mappedData.ville_societe || null,
          item.mappedData.poste || null,
          item.mappedData.departement,
          item.mappedData.est_premiere_main,
          item.mappedData.date_acquisition
        ]);

        importedItems.push(result.rows[0]);
      } catch (error) {
        errors.push(`Ligne ${item.rowIndex}: ${error.message}`);
      }
    }

    // Préparation de la réponse avec informations Ultra IA
    const response = {
      message: `Import Ultra IA terminé: ${importedItems.length} éléments importés`,
      imported: importedItems.length,
      errors: errors.length,
      warnings: warnings.length,
      aiWarnings: aiWarnings.length,
      errorDetails: errors,
      warningDetails: warnings,
      aiWarningDetails: aiWarnings,
      success: errors.length === 0,
      ultraAI: {
        intelligenceLevel: aiAnalysis.intelligenceLevel,
        confidence: Math.round(aiAnalysis.confidence * 100),
        columnsDetected: Object.keys(aiAnalysis.columnMapping).length,
        totalRows: aiAnalysis.totalRows,
        columnMapping: aiAnalysis.columnMapping,
        transformations: aiAnalysis.analyzedData.reduce((sum, item) => sum + (item.transformations ? item.transformations.length : 0), 0)
      }
    };

    console.log('📊 Résultat de l\'import Ultra IA:');
    console.log(`   - Importés: ${response.imported}`);
    console.log(`   - Erreurs: ${response.errors}`);
    console.log(`   - Avertissements: ${response.warnings}`);
    console.log(`   - Avertissements IA: ${response.aiWarnings}`);
    console.log(`   - Transformations: ${response.ultraAI.transformations}`);

    res.json(response);
  } catch (error) {
    console.error('Import parc informatique Super IA error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
