// Script pour vérifier les données dans la table parc_informatique
import { pool } from './src/config/database-unified.js';

async function checkParcData() {
  try {
    console.log('🔍 Vérification des données dans parc_informatique...\n');
    
    // Compter le nombre total d'éléments
    const countResult = await pool.query('SELECT COUNT(*) FROM parc_informatique');
    console.log(`📊 Nombre total d'éléments: ${countResult.rows[0].count}`);
    
    // Récupérer les 5 derniers éléments
    const recentResult = await pool.query(`
      SELECT id, type, marque, modele, proprietaire, date_acquisition, created_at
      FROM parc_informatique 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n📋 5 derniers éléments:');
    recentResult.rows.forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id} | ${item.type} | ${item.marque} | ${item.proprietaire} | ${item.date_acquisition}`);
    });
    
    // Tester la requête avec calculs d'âge
    console.log('\n🧮 Test de la requête avec calculs d\'âge:');
    const ageResult = await pool.query(`
      SELECT id, type, marque, proprietaire, 
             EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_acquisition)) as age_ans,
             CASE 
               WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_acquisition)) > 5 THEN true 
               ELSE false 
             END as est_ancien
      FROM parc_informatique 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    ageResult.rows.forEach((item, index) => {
      console.log(`${index + 1}. ${item.type} ${item.marque} - Âge: ${item.age_ans} ans - Ancien: ${item.est_ancien}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

checkParcData();
