// Script pour corriger la contrainte de la base de données
import { pool } from './server/src/config/database-unified.js';

async function fixDatabaseConstraint() {
  try {
    console.log('🔧 Correction de la contrainte de la base de données...');
    
    // Supprimer l'ancienne contrainte
    console.log('1️⃣ Suppression de l\'ancienne contrainte...');
    await pool.query(`
      ALTER TABLE parc_informatique 
      DROP CONSTRAINT IF EXISTS parc_informatique_type_check
    `);
    console.log('✅ Ancienne contrainte supprimée');
    
    // Ajouter la nouvelle contrainte avec tous les types
    console.log('2️⃣ Ajout de la nouvelle contrainte...');
    await pool.query(`
      ALTER TABLE parc_informatique 
      ADD CONSTRAINT parc_informatique_type_check 
      CHECK (type IN ('laptop', 'desktop', 'unite_centrale', 'clavier', 'imprimante', 'telephone', 'routeur', 'serveur', 'autre'))
    `);
    console.log('✅ Nouvelle contrainte ajoutée');
    
    // Vérifier que la contrainte fonctionne
    console.log('3️⃣ Test de la nouvelle contrainte...');
    const testResult = await pool.query(`
      INSERT INTO parc_informatique (type, marque, proprietaire, date_acquisition)
      VALUES ('serveur', 'Test Server', 'Test User', '2023-01-01')
      RETURNING id, type
    `);
    console.log('✅ Test réussi:', testResult.rows[0]);
    
    // Supprimer l'élément de test
    await pool.query('DELETE FROM parc_informatique WHERE marque = $1', ['Test Server']);
    console.log('✅ Élément de test supprimé');
    
    console.log('🎉 Contrainte de base de données corrigée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
  } finally {
    await pool.end();
  }
}

fixDatabaseConstraint();


