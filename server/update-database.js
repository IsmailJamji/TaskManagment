import { pool } from './src/config/database-unified.js';
import fs from 'fs';

async function updateDatabase() {
  try {
    console.log('🔄 Mise à jour de la base de données...');
    
    const sql = fs.readFileSync('./add-equipements-supplementaires.sql', 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Colonnes ajoutées avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

updateDatabase();

