import { pool } from './src/config/database-unified.js';

async function addEquipementsColumn() {
  try {
    console.log('🔧 Ajout de la colonne equipements_supplementaires...');
    
    // Ajouter la colonne equipements_supplementaires
    await pool.query(`
      ALTER TABLE parc_informatique 
      ADD COLUMN IF NOT EXISTS equipements_supplementaires JSONB DEFAULT '{}'
    `);
    
    console.log('✅ Colonne equipements_supplementaires ajoutée avec succès');
    
    // Vérifier la structure de la table
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'parc_informatique' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Structure de la table parc_informatique:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

addEquipementsColumn();

