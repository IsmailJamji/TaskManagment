import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'taskforge',
  password: '1234',
  port: 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
export async function initDatabase() {
  try {
    // Create Users table
    await pool.query(`
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

    // Add department column to existing users table if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE users ADD COLUMN department VARCHAR(100)
      `);
      console.log('Added department column to users table');
    } catch (error: any) {
      if (error.code === '42701') {
        // Column already exists, ignore
        console.log('Department column already exists in users table');
      } else {
        throw error;
      }
    }

    // Create Tasks table
    await pool.query(`
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

    // Create Comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Parc Informatique table
    await pool.query(`
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

    // Add missing columns if they don't exist
    try {
      await pool.query(`ALTER TABLE parc_informatique ADD COLUMN IF NOT EXISTS ticket_numero VARCHAR(100)`);
      await pool.query(`ALTER TABLE parc_informatique ADD COLUMN IF NOT EXISTS equipements_supplementaires JSONB DEFAULT '{}'`);
      await pool.query(`ALTER TABLE parc_informatique ADD COLUMN IF NOT EXISTS ville_societe VARCHAR(100)`);
      await pool.query(`ALTER TABLE parc_informatique ADD COLUMN IF NOT EXISTS poste VARCHAR(100)`);
      console.log('✅ Colonnes manquantes ajoutées à parc_informatique');
    } catch (error: any) {
      if (error.code !== '42701') { // Column already exists
        console.log('⚠️ Erreur lors de l\'ajout des colonnes:', error.message);
      }
    }

    // Create Parc Télécom table
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

    // Create Projets table
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

    // Create Sous-tâches table
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

    // Create Projet équipes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projet_equipes (
        id SERIAL PRIMARY KEY,
        projet_id INTEGER REFERENCES projets(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(projet_id, user_id)
      )
    `);

    

    // Set proper departments for existing users
    await pool.query(`
      UPDATE users SET department = 'IT' WHERE email = 'admin@taskforge.com'
    `);
    
    await pool.query(`
      UPDATE users SET department = 'IT' WHERE email = 'admin2@taskforge.com'
    `);
    
    await pool.query(`
      UPDATE users SET department = 'Operations' WHERE email = 'aaa@taskforge.com'
    `);

    // Create default admin user if it doesn't exist (password: admin123)
    const adminExists = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@taskforge.com']);
    
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(`
        INSERT INTO users (name, email, password_hash, role, department) 
        VALUES ($1, $2, $3, $4, $5)
      `, ['System Admin', 'admin@taskforge.com', hashedPassword, 'admin', 'IT']);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}