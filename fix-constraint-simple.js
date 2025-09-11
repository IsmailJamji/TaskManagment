// Script simple pour corriger la contrainte
import pkg from 'pg';
const { Client } = pkg;

async function fixConstraint() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'TaskManager',
    user: 'postgres',
    password: '1234'
  });

  try {
    await client.connect();
    console.log('🔧 Connexion à la base de données...');
    
    // Supprimer l'ancienne contrainte
    console.log('1️⃣ Suppression de l\'ancienne contrainte...');
    await client.query(`
      ALTER TABLE parc_informatique 
      DROP CONSTRAINT IF EXISTS parc_informatique_type_check
    `);
    console.log('✅ Ancienne contrainte supprimée');
    
    // Ajouter la nouvelle contrainte
    console.log('2️⃣ Ajout de la nouvelle contrainte...');
    await client.query(`
      ALTER TABLE parc_informatique 
      ADD CONSTRAINT parc_informatique_type_check 
      CHECK (type IN ('laptop', 'desktop', 'unite_centrale', 'clavier', 'imprimante', 'telephone', 'routeur', 'serveur', 'autre'))
    `);
    console.log('✅ Nouvelle contrainte ajoutée');
    
    // Test
    console.log('3️⃣ Test de la nouvelle contrainte...');
    const result = await client.query(`
      INSERT INTO parc_informatique (type, marque, proprietaire, date_acquisition)
      VALUES ('serveur', 'Test Server', 'Test User', '2023-01-01')
      RETURNING id, type
    `);
    console.log('✅ Test réussi:', result.rows[0]);
    
    // Nettoyer
    await client.query('DELETE FROM parc_informatique WHERE marque = $1', ['Test Server']);
    console.log('✅ Élément de test supprimé');
    
    console.log('🎉 Contrainte corrigée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

fixConstraint();


