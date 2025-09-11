import { pool } from '../src/config/database.js';
import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Admin Principal',
    email: 'admin@taskforge.com',
    password: 'admin123',
    role: 'admin',
    department: 'IT'
  },
  {
    name: 'Ahmed Benali',
    email: 'ahmed.benali@company.com',
    password: 'user123',
    role: 'user',
    department: 'Développement'
  },
  {
    name: 'Fatima Alami',
    email: 'fatima.alami@company.com',
    password: 'user123',
    role: 'user',
    department: 'Marketing'
  },
  {
    name: 'Youssef Idrissi',
    email: 'youssef.idrissi@company.com',
    password: 'user123',
    role: 'user',
    department: 'Ventes'
  },
  {
    name: 'Aicha Tazi',
    email: 'aicha.tazi@company.com',
    password: 'user123',
    role: 'user',
    department: 'Ressources Humaines'
  },
  {
    name: 'Omar Chraibi',
    email: 'omar.chraibi@company.com',
    password: 'user123',
    role: 'user',
    department: 'Finance'
  },
  {
    name: 'Khadija Mansouri',
    email: 'khadija.mansouri@company.com',
    password: 'user123',
    role: 'user',
    department: 'Support Technique'
  },
  {
    name: 'Hassan El Fassi',
    email: 'hassan.elfassi@company.com',
    password: 'user123',
    role: 'user',
    department: 'Production'
  },
  {
    name: 'Naima Benslimane',
    email: 'naima.benslimane@company.com',
    password: 'user123',
    role: 'user',
    department: 'Qualité'
  },
  {
    name: 'Rachid Alaoui',
    email: 'rachid.alaoui@company.com',
    password: 'user123',
    role: 'user',
    department: 'Logistique'
  }
];

async function seedUsers() {
  try {
    console.log('Début de la création des utilisateurs...');
    
    for (const user of users) {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [user.email]);
      
      if (existingUser.rows.length > 0) {
        console.log(`Utilisateur ${user.email} existe déjà`);
        continue;
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Insérer l'utilisateur
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, department, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.name, user.email, hashedPassword, user.role, user.department, true]
      );
      
      console.log(`Utilisateur créé: ${user.name} (${user.email}) - ${user.role} - ${user.department}`);
    }
    
    console.log('Création des utilisateurs terminée !');
    console.log('\nComptes de test:');
    console.log('Admin: admin@taskforge.com / admin123');
    console.log('Utilisateurs: [email] / user123');
    
  } catch (error) {
    console.error('Erreur lors de la création des utilisateurs:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedUsers();
