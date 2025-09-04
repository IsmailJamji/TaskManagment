import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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