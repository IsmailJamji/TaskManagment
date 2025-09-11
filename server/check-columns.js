import { pool } from './src/config/database-unified.js';

async function checkColumns() {
  try {
    console.log('🔍 Vérification des colonnes de la table parc_informatique...');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'parc_informatique' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colonnes existantes:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Vérifier si equipements_supplementaires existe
    const hasEquipements = result.rows.some(row => row.column_name === 'equipements_supplementaires');
    console.log(`\n🔧 equipements_supplementaires existe: ${hasEquipements}`);
    
    if (!hasEquipements) {
      console.log('➕ Ajout de la colonne equipements_supplementaires...');
      await pool.query(`
        ALTER TABLE parc_informatique 
        ADD COLUMN equipements_supplementaires JSONB DEFAULT '{}'
      `);
      console.log('✅ Colonne ajoutée avec succès');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkColumns();

