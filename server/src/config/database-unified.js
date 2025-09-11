import pg from 'pg';
import { initSQLiteDatabase, pool as sqlitePool } from './database-sqlite.js';

const { Pool } = pg;

let currentPool = null;
let dbType = 'unknown';

// Configuration PostgreSQL
const pgPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '1234',
  port: 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Fonction pour initialiser la base de données
export async function initUnifiedDatabase() {
  try {
    // Forcer l'utilisation de PostgreSQL
    console.log('🔄 Connexion à PostgreSQL...');
    await pgPool.query('SELECT 1');
    console.log('✅ Connexion PostgreSQL réussie !');
    
    // Créer un nouveau pool pour la base TaskManager
    const taskManagerPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'TaskManager',
      password: '1234',
      port: 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    currentPool = taskManagerPool;
    dbType = 'postgresql';
    
    // Initialiser les tables PostgreSQL (créer seulement celles qui manquent)
    await initPostgreSQLTables();
    
    return currentPool;
  } catch (pgError) {
    console.error('❌ Erreur PostgreSQL:', pgError.message);
    throw new Error('Impossible de se connecter à PostgreSQL. Veuillez vérifier la configuration.');
  }
}

// Fonction pour créer la base de données TaskManager
async function createTaskManagerDatabase() {
  try {
    console.log('🔧 Vérification de la base de données TaskManager...');
    
    // Vérifier si la base TaskManager existe
    const dbCheck = await pgPool.query(`
      SELECT datname FROM pg_database WHERE datname = 'TaskManager'
    `);
    
    if (dbCheck.rows.length === 0) {
      console.log('📝 Création de la base de données TaskManager...');
      await pgPool.query('CREATE DATABASE "TaskManager"');
      console.log('✅ Base de données TaskManager créée');
    } else {
      console.log('✅ Base de données TaskManager existe déjà');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la base de données:', error.message);
    throw error;
  }
}

// Fonction pour initialiser les tables PostgreSQL
async function initPostgreSQLTables() {
  try {
    console.log('🔧 Initialisation des tables PostgreSQL...');
    
    // Créer un pool temporaire pour la base TaskManager
    const tempPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'TaskManager',
      password: '1234',
      port: 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // Créer les tables si elles n'existent pas
    await tempPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        is_active BOOLEAN DEFAULT true,
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await tempPool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assignee_id INTEGER REFERENCES users(id),
        assigner_id INTEGER REFERENCES users(id),
        due_date DATE,
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await tempPool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await tempPool.query(`
      CREATE TABLE IF NOT EXISTS parc_informatique (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL CHECK (type IN ('laptop', 'unite_centrale', 'clavier', 'imprimante', 'telephone', 'routeur', 'autre')),
        marque VARCHAR(100) NOT NULL,
        modele VARCHAR(100),
        serial_number VARCHAR(100),
        ticket_numero VARCHAR(100),
        specifications JSONB,
        equipements_supplementaires JSONB DEFAULT '{}',
        proprietaire VARCHAR(100) NOT NULL,
        ville_societe VARCHAR(100),
        poste VARCHAR(100),
        departement VARCHAR(100),
        est_premiere_main BOOLEAN DEFAULT true,
        date_acquisition DATE NOT NULL,
        age_ans INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_acquisition))) STORED,
        est_ancien BOOLEAN GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_acquisition)) > 5) STORED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await tempPool.query(`
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

    await tempPool.query(`
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

    await tempPool.query(`
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

    await tempPool.query(`
      CREATE TABLE IF NOT EXISTS projet_equipes (
        id SERIAL PRIMARY KEY,
        projet_id INTEGER REFERENCES projets(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(projet_id, user_id)
      )
    `);

    // Créer l'utilisateur admin par défaut
    const adminExists = await tempPool.query('SELECT id FROM users WHERE email = $1', ['admin@taskforge.com']);
    if (adminExists.rows.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 10);
      
      await tempPool.query(`
        INSERT INTO users (name, email, password_hash, role, department) 
        VALUES ($1, $2, $3, $4, $5)
      `, ['System Admin', 'admin@taskforge.com', hashedPassword, 'admin', 'IT']);
      
      console.log('✅ Utilisateur admin créé');
    } else {
      console.log('ℹ️  Utilisateur admin existe déjà');
    }
    
    // Ajouter les colonnes manquantes à la table existante
    try {
      await tempPool.query(`
        ALTER TABLE parc_informatique 
        ADD COLUMN IF NOT EXISTS equipements_supplementaires JSONB DEFAULT '{}'
      `);
      console.log('✅ Colonne equipements_supplementaires ajoutée');
    } catch (error) {
      if (error.code !== '42701') { // Column already exists
        console.log('⚠️ Erreur lors de l\'ajout de equipements_supplementaires:', error.message);
      }
    }
    
    try {
      await tempPool.query(`
        ALTER TABLE parc_informatique 
        ADD COLUMN IF NOT EXISTS ticket_numero VARCHAR(100)
      `);
      console.log('✅ Colonne ticket_numero ajoutée');
    } catch (error) {
      if (error.code !== '42701') {
        console.log('⚠️ Erreur lors de l\'ajout de ticket_numero:', error.message);
      }
    }
    
    try {
      await tempPool.query(`
        ALTER TABLE parc_informatique 
        ADD COLUMN IF NOT EXISTS ville_societe VARCHAR(100)
      `);
      console.log('✅ Colonne ville_societe ajoutée');
    } catch (error) {
      if (error.code !== '42701') {
        console.log('⚠️ Erreur lors de l\'ajout de ville_societe:', error.message);
      }
    }
    
    try {
      await tempPool.query(`
        ALTER TABLE parc_informatique 
        ADD COLUMN IF NOT EXISTS poste VARCHAR(100)
      `);
      console.log('✅ Colonne poste ajoutée');
    } catch (error) {
      if (error.code !== '42701') {
        console.log('⚠️ Erreur lors de l\'ajout de poste:', error.message);
      }
    }
    
    // Fermer le pool temporaire
    await tempPool.end();
    
    console.log('✅ Tables PostgreSQL initialisées avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des tables PostgreSQL:', error);
    throw error;
  }
}

// Export du pool actuel
export const pool = {
  query: async (text, params = []) => {
    if (!currentPool) {
      throw new Error('Base de données non initialisée');
    }
    return await currentPool.query(text, params);
  },
  connect: async () => {
    if (!currentPool) {
      throw new Error('Base de données non initialisée');
    }
    return await currentPool.connect();
  },
  end: async () => {
    if (currentPool) {
      await currentPool.end();
    }
  }
};

export { dbType };
