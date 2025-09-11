// Script simple pour vérifier les données
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'TaskManager',
  password: 'admin123',
  port: 5432,
});

async function checkData() {
  try {
    console.log('🔍 Vérification des données...\n');
    
    // Compter les éléments
    const countResult = await pool.query('SELECT COUNT(*) FROM parc_informatique');
    console.log(`📊 Nombre total d'éléments: ${countResult.rows[0].count}`);
    
    // Récupérer quelques éléments
    const dataResult = await pool.query(`
      SELECT id, type, marque, modele, proprietaire, date_acquisition, created_at
      FROM parc_informatique 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n📋 5 derniers éléments:');
    dataResult.rows.forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id} | ${item.type} | ${item.marque} | ${item.proprietaire}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

checkData();
