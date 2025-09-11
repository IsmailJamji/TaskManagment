import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export async function initSQLiteDatabase() {
  try {
    console.log('🔧 Initialisation de SQLite...');
    
    // Ouvrir la base de données SQLite
    db = await open({
      filename: path.join(__dirname, '../../taskmanager.db'),
      driver: sqlite3.Database
    });

    // Créer les tables
    await createTables();
    
    // Créer l'utilisateur admin par défaut
    await createDefaultAdmin();
    
    console.log('✅ Base de données SQLite initialisée avec succès !');
    return db;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation SQLite:', error);
    throw error;
  }
}

async function createTables() {
  // Table users
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      is_active BOOLEAN DEFAULT 1,
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table tasks
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      assignee_id INTEGER REFERENCES users(id),
      assigner_id INTEGER REFERENCES users(id),
      due_date DATE,
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table comments
  await db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      comment_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table parc_informatique
  await db.exec(`
    CREATE TABLE IF NOT EXISTS parc_informatique (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('laptop', 'unite_centrale', 'clavier', 'imprimante', 'telephone', 'routeur', 'autre')),
      marque TEXT NOT NULL,
      modele TEXT,
      serial_number TEXT,
      specifications TEXT, -- JSON stocké comme texte
      proprietaire TEXT NOT NULL,
      departement TEXT,
      est_premiere_main BOOLEAN DEFAULT 1,
      date_acquisition DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table parc_telecom
  await db.exec(`
    CREATE TABLE IF NOT EXISTS parc_telecom (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_puce TEXT,
      operateur TEXT NOT NULL CHECK (operateur IN ('iam', 'inwi')),
      proprietaire TEXT NOT NULL,
      departement TEXT,
      specifications TEXT, -- JSON stocké comme texte
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table projets
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      description TEXT,
      chef_projet_id INTEGER REFERENCES users(id),
      date_debut DATE NOT NULL,
      date_fin_prevue DATE NOT NULL,
      statut TEXT DEFAULT 'planifie' CHECK (statut IN ('planifie', 'en_cours', 'suspendu', 'termine', 'annule')),
      priorite TEXT DEFAULT 'medium' CHECK (priorite IN ('low', 'medium', 'high')),
      budget REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table sous_taches
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sous_taches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projet_id INTEGER REFERENCES projets(id) ON DELETE CASCADE,
      nom TEXT NOT NULL,
      description TEXT,
      assigne_id INTEGER REFERENCES users(id),
      date_debut DATE,
      date_fin_prevue DATE,
      statut TEXT DEFAULT 'not_started' CHECK (statut IN ('not_started', 'in_progress', 'completed')),
      priorite TEXT DEFAULT 'medium' CHECK (priorite IN ('low', 'medium', 'high')),
      progression INTEGER DEFAULT 0 CHECK (progression >= 0 AND progression <= 100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table projet_equipes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projet_equipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projet_id INTEGER REFERENCES projets(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(projet_id, user_id)
    )
  `);
}

async function createDefaultAdmin() {
  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await db.get('SELECT id FROM users WHERE email = ?', ['admin@taskforge.com']);
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.run(`
        INSERT INTO users (name, email, password_hash, role, department, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['System Admin', 'admin@taskforge.com', hashedPassword, 'admin', 'IT', 1]);
      
      console.log('✅ Utilisateur admin créé');
    } else {
      console.log('ℹ️  Utilisateur admin existe déjà');
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'admin:', error);
  }
}

// Wrapper pour les requêtes SQLite compatibles avec PostgreSQL
export const pool = {
  query: async (text, params = []) => {
    try {
      // Convertir les paramètres PostgreSQL ($1, $2) vers SQLite (?, ?)
      let sqliteQuery = text;
      let sqliteParams = [...params];
      
      // Remplacer les paramètres $1, $2, etc. par ?, ?, etc.
      sqliteQuery = sqliteQuery.replace(/\$(\d+)/g, '?');
      
      // Gérer les requêtes RETURNING
      if (sqliteQuery.includes('RETURNING')) {
        // Pour SQLite, on doit faire l'INSERT puis un SELECT
        const insertMatch = sqliteQuery.match(/^(INSERT INTO \w+[^;]+);/i);
        if (insertMatch) {
          const insertQuery = insertMatch[1];
          const result = await db.run(insertQuery, sqliteParams);
          
          // Récupérer l'ID de la dernière insertion
          const lastId = result.lastID;
          
          // Faire un SELECT pour récupérer la ligne insérée
          const tableName = insertQuery.match(/INSERT INTO (\w+)/i)[1];
          const selectQuery = `SELECT * FROM ${tableName} WHERE id = ?`;
          const rows = await db.all(selectQuery, [lastId]);
          
          // Traiter les champs JSON pour SQLite
          const processedRows = rows.map(row => {
            const processedRow = { ...row };
            
            // Convertir les champs specifications de string JSON vers objet
            if (processedRow.specifications && typeof processedRow.specifications === 'string') {
              try {
                processedRow.specifications = JSON.parse(processedRow.specifications);
              } catch (e) {
                // Si ce n'est pas du JSON valide, garder la valeur originale
              }
            }
            
            return processedRow;
          });
          
          return { rows: processedRows };
        }
      }
      
      if (sqliteQuery.trim().toUpperCase().startsWith('SELECT')) {
        const rows = await db.all(sqliteQuery, sqliteParams);
        
        // Traiter les champs JSON pour SQLite
        const processedRows = rows.map(row => {
          const processedRow = { ...row };
          
          // Convertir les champs specifications de string JSON vers objet
          if (processedRow.specifications && typeof processedRow.specifications === 'string') {
            try {
              processedRow.specifications = JSON.parse(processedRow.specifications);
            } catch (e) {
              // Si ce n'est pas du JSON valide, garder la valeur originale
            }
          }
          
          return processedRow;
        });
        
        return { rows: processedRows };
      } else if (sqliteQuery.trim().toUpperCase().startsWith('UPDATE')) {
        const result = await db.run(sqliteQuery, sqliteParams);
        // Pour UPDATE, on retourne la ligne mise à jour si possible
        if (result.changes > 0) {
          // Essayer de récupérer la ligne mise à jour
          const updateMatch = sqliteQuery.match(/UPDATE (\w+)/i);
          if (updateMatch) {
            const tableName = updateMatch[1];
            const whereMatch = sqliteQuery.match(/WHERE (.+)/i);
            if (whereMatch) {
              const whereClause = whereMatch[1].replace(/\$(\d+)/g, '?');
              const selectQuery = `SELECT * FROM ${tableName} WHERE ${whereClause}`;
              const rows = await db.all(selectQuery, sqliteParams);
              
              // Traiter les champs JSON pour SQLite
              const processedRows = rows.map(row => {
                const processedRow = { ...row };
                
                // Convertir les champs specifications de string JSON vers objet
                if (processedRow.specifications && typeof processedRow.specifications === 'string') {
                  try {
                    processedRow.specifications = JSON.parse(processedRow.specifications);
                  } catch (e) {
                    // Si ce n'est pas du JSON valide, garder la valeur originale
                  }
                }
                
                return processedRow;
              });
              
              return { rows: processedRows.length > 0 ? [processedRows[0]] : [], rowCount: result.changes };
            }
          }
        }
        return { 
          rows: [],
          rowCount: result.changes 
        };
      } else {
        const result = await db.run(sqliteQuery, sqliteParams);
        return { 
          rows: result.lastID ? [{ id: result.lastID }] : [],
          rowCount: result.changes 
        };
      }
    } catch (error) {
      console.error('Erreur SQLite:', error);
      console.error('Query:', text);
      console.error('Params:', params);
      throw error;
    }
  },
  connect: async () => {
    // Pour SQLite, on retourne un wrapper qui simule une connexion
    return {
      query: pool.query,
      release: () => {} // SQLite n'a pas besoin de libérer les connexions
    };
  },
  end: async () => {
    if (db) {
      await db.close();
    }
  }
};

export { db };
