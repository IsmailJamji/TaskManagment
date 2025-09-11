// Test de connexion PostgreSQL avec différentes configurations
import pg from 'pg';

const { Pool } = pg;

async function testPostgreSQLConnection() {
  console.log('🧪 Test de connexion PostgreSQL...\n');
  
  // Configuration 1: Utilisateur par défaut postgres
  console.log('1. Test avec utilisateur postgres par défaut...');
  try {
    const pool1 = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'postgres',
      port: 5432,
      ssl: false
    });
    
    const result1 = await pool1.query('SELECT 1 as test');
    console.log('✅ Connexion réussie avec postgres/postgres');
    
    // Vérifier si la base TaskManager existe
    const dbCheck = await pool1.query(`
      SELECT datname FROM pg_database WHERE datname = 'TaskManager'
    `);
    
    if (dbCheck.rows.length === 0) {
      console.log('📝 Création de la base de données TaskManager...');
      await pool1.query('CREATE DATABASE "TaskManager"');
      console.log('✅ Base de données TaskManager créée');
    } else {
      console.log('✅ Base de données TaskManager existe déjà');
    }
    
    // Vérifier si l'utilisateur TaskManager_user existe
    const userCheck = await pool1.query(`
      SELECT usename FROM pg_user WHERE usename = 'TaskManager_user'
    `);
    
    if (userCheck.rows.length === 0) {
      console.log('📝 Création de l\'utilisateur TaskManager_user...');
      await pool1.query(`
        CREATE USER "TaskManager_user" WITH PASSWORD 'taskmanager_pass'
      `);
      console.log('✅ Utilisateur TaskManager_user créé');
    } else {
      console.log('✅ Utilisateur TaskManager_user existe déjà');
    }
    
    // Donner les privilèges
    console.log('📝 Attribution des privilèges...');
    await pool1.query(`
      GRANT ALL PRIVILEGES ON DATABASE "TaskManager" TO "TaskManager_user"
    `);
    console.log('✅ Privilèges attribués');
    
    await pool1.end();
    
  } catch (error) {
    console.log('❌ Erreur avec postgres/postgres:', error.message);
  }
  
  // Configuration 2: Utilisateur TaskManager_user
  console.log('\n2. Test avec utilisateur TaskManager_user...');
  try {
    const pool2 = new Pool({
      user: 'TaskManager_user',
      host: 'localhost',
      database: 'TaskManager',
      password: 'taskmanager_pass',
      port: 5432,
      ssl: false
    });
    
    const result2 = await pool2.query('SELECT 1 as test');
    console.log('✅ Connexion réussie avec TaskManager_user');
    
    // Vérifier les tables existantes
    const tablesResult = await pool2.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tables existantes:', tablesResult.rows.length);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    await pool2.end();
    console.log('✅ Test de connexion TaskManager_user réussi !');
    
  } catch (error) {
    console.log('❌ Erreur avec TaskManager_user:', error.message);
  }
  
  // Configuration 3: Test avec différents mots de passe
  console.log('\n3. Test avec différents mots de passe...');
  const passwords = ['postgres', 'admin', 'password', '123456', ''];
  
  for (const password of passwords) {
    try {
      const pool3 = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: password,
        port: 5432,
        ssl: false
      });
      
      await pool3.query('SELECT 1');
      console.log(`✅ Mot de passe postgres trouvé: "${password}"`);
      await pool3.end();
      break;
      
    } catch (error) {
      console.log(`❌ Mot de passe "${password}" incorrect`);
    }
  }
  
  console.log('\n🎉 Test de connexion terminé !');
}

testPostgreSQLConnection();



