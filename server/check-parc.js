import { pool } from './src/config/database-unified.js';

async function checkParc() {
  try {
    console.log('🔍 Vérification du parc informatique...');
    
    // Vérifier le nombre d'équipements
    const countResult = await pool.query('SELECT COUNT(*) FROM parc_informatique');
    console.log('📊 Nombre d\'équipements:', countResult.rows[0].count);
    
    // Vérifier la structure de la table
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'parc_informatique' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Structure de la table:');
    structureResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Vérifier s'il y a des données
    const dataResult = await pool.query('SELECT * FROM parc_informatique LIMIT 5');
    console.log('📄 Données existantes:', dataResult.rows.length, 'lignes');
    
    if (dataResult.rows.length > 0) {
      console.log('📝 Premier équipement:', dataResult.rows[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkParc();

