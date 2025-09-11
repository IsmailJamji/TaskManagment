// Script pour mettre à jour la base de données
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'TaskManager'
});

async function updateDatabase() {
  try {
    console.log('🔄 Mise à jour de la base de données...');
    
    // Ajouter les nouveaux champs à parc_informatique
    await pool.query(`
      ALTER TABLE parc_informatique 
      ADD COLUMN IF NOT EXISTS ville_societe VARCHAR(255),
      ADD COLUMN IF NOT EXISTS poste VARCHAR(255)
    `);
    console.log('✅ Champs ajoutés à parc_informatique');
    
    // Ajouter les nouveaux champs à parc_telecom
    await pool.query(`
      ALTER TABLE parc_telecom 
      ADD COLUMN IF NOT EXISTS ville_societe VARCHAR(255),
      ADD COLUMN IF NOT EXISTS poste VARCHAR(255)
    `);
    console.log('✅ Champs ajoutés à parc_telecom');
    
    // Mettre à jour les données existantes
    await pool.query(`
      UPDATE parc_informatique 
      SET ville_societe = proprietaire 
      WHERE ville_societe IS NULL
    `);
    console.log('✅ Données mises à jour dans parc_informatique');
    
    await pool.query(`
      UPDATE parc_telecom 
      SET ville_societe = proprietaire 
      WHERE ville_societe IS NULL
    `);
    console.log('✅ Données mises à jour dans parc_telecom');
    
    console.log('🎉 Base de données mise à jour avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.message);
  } finally {
    await pool.end();
  }
}

updateDatabase();
