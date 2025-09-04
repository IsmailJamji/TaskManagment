import { pool } from '../src/config/database.js';
import bcrypt from 'bcryptjs';

async function ensureAdmin() {
  try {
    const adminCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@taskforge.com']);
    if (adminCheck.rows.length > 0) {
      console.log('Admin already exists');
      return;
    }

    const hashed = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)`,
      ['System Admin', 'admin@taskforge.com', hashed, 'admin']
    );
    console.log('Admin created: admin@taskforge.com / admin123');
  } catch (err) {
    console.error('Seed admin error:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

ensureAdmin();


