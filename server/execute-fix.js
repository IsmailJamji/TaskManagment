import { pool } from './src/config/database-unified.js';
import fs from 'fs';

async function executeFix() {
  try {
    console.log('🔧 Exécution du script de correction...');
    
    const sql = fs.readFileSync('./fix-parc-informatique.sql', 'utf8');
    
    const result = await pool.query(sql);
    
    console.log('✅ Script exécuté avec succès');
    console.log('📋 Structure de la table:');
    
    if (result.rows && result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

executeFix();

