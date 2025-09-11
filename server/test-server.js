// Test simple du serveur
import { initUnifiedDatabase } from './src/config/database-unified.js';

async function testServer() {
  try {
    console.log('🧪 Test du serveur avec PostgreSQL...\n');
    
    console.log('1. Initialisation de la base de données...');
    const pool = await initUnifiedDatabase();
    console.log('✅ Base de données initialisée !');
    
    console.log('\n2. Test des tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('✅ Tables disponibles:', tablesResult.rows.length);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    console.log('\n3. Test des utilisateurs...');
    const usersResult = await pool.query('SELECT id, name, email, role FROM users LIMIT 5');
    console.log('✅ Utilisateurs:', usersResult.rows.length);
    usersResult.rows.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
    
    console.log('\n4. Test de création d\'une table...');
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS test_table (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Table de test créée');
      
      // Nettoyer
      await pool.query('DROP TABLE IF EXISTS test_table');
      console.log('✅ Table de test supprimée');
      
    } catch (error) {
      console.log('⚠️  Erreur lors du test de table:', error.message);
    }
    
    await pool.end();
    console.log('\n🎉 Test du serveur terminé avec succès !');
    console.log('✅ PostgreSQL est prêt à être utilisé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test du serveur:', error.message);
    console.error('Stack:', error.stack);
  }
}

testServer();



