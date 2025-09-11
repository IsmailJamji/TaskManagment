// Script pour créer les tables manquantes
import pg from 'pg';

const { Pool } = pg;

async function createMissingTables() {
  try {
    console.log('🔧 Création des tables manquantes...\n');
    
    const pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'TaskManager',
      password: '1234',
      port: 5432,
      ssl: false
    });
    
    console.log('1. Vérification des tables existantes...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tables existantes:', tablesResult.rows.length);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    console.log('\n2. Création des tables manquantes...');
    
    // Créer parc_informatique
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS parc_informatique (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL CHECK (type IN ('laptop', 'unite_centrale', 'clavier', 'imprimante', 'telephone', 'routeur', 'autre')),
          marque VARCHAR(100) NOT NULL,
          modele VARCHAR(100),
          serial_number VARCHAR(100),
          specifications JSONB,
          proprietaire VARCHAR(100) NOT NULL,
          departement VARCHAR(100),
          est_premiere_main BOOLEAN DEFAULT true,
          date_acquisition DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Table parc_informatique créée');
    } catch (error) {
      console.log('⚠️  Table parc_informatique:', error.message);
    }
    
    // Créer parc_telecom
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS parc_telecom (
          id SERIAL PRIMARY KEY,
          numero_puce VARCHAR(20),
          operateur VARCHAR(10) NOT NULL CHECK (operateur IN ('iam', 'inwi')),
          proprietaire VARCHAR(255) NOT NULL,
          departement VARCHAR(100),
          specifications JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Table parc_telecom créée');
    } catch (error) {
      console.log('⚠️  Table parc_telecom:', error.message);
    }
    
    // Créer projets
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS projets (
          id SERIAL PRIMARY KEY,
          nom VARCHAR(255) NOT NULL,
          description TEXT,
          chef_projet_id INTEGER REFERENCES users(id),
          date_debut DATE NOT NULL,
          date_fin_prevue DATE NOT NULL,
          statut VARCHAR(20) DEFAULT 'planifie' CHECK (statut IN ('planifie', 'en_cours', 'suspendu', 'termine', 'annule')),
          priorite VARCHAR(20) DEFAULT 'medium' CHECK (priorite IN ('low', 'medium', 'high')),
          budget DECIMAL(15,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Table projets créée');
    } catch (error) {
      console.log('⚠️  Table projets:', error.message);
    }
    
    // Créer sous_taches
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS sous_taches (
          id SERIAL PRIMARY KEY,
          projet_id INTEGER REFERENCES projets(id) ON DELETE CASCADE,
          nom VARCHAR(255) NOT NULL,
          description TEXT,
          assigne_id INTEGER REFERENCES users(id),
          date_debut DATE,
          date_fin_prevue DATE,
          statut VARCHAR(20) DEFAULT 'not_started' CHECK (statut IN ('not_started', 'in_progress', 'completed')),
          priorite VARCHAR(20) DEFAULT 'medium' CHECK (priorite IN ('low', 'medium', 'high')),
          progression INTEGER DEFAULT 0 CHECK (progression >= 0 AND progression <= 100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Table sous_taches créée');
    } catch (error) {
      console.log('⚠️  Table sous_taches:', error.message);
    }
    
    // Créer projet_equipes
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS projet_equipes (
          id SERIAL PRIMARY KEY,
          projet_id INTEGER REFERENCES projets(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(projet_id, user_id)
        )
      `);
      console.log('✅ Table projet_equipes créée');
    } catch (error) {
      console.log('⚠️  Table projet_equipes:', error.message);
    }
    
    console.log('\n3. Vérification finale...');
    const finalTablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tables finales:', finalTablesResult.rows.length);
    finalTablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    await pool.end();
    console.log('\n🎉 Tables créées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createMissingTables();



