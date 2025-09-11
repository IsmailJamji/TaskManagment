// Script pour exécuter les requêtes SQL
import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;

async function executeSQL() {
  try {
    console.log('🔧 Exécution des requêtes SQL pour créer les tables...\n');
    
    const pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'TaskManager',
      password: '1234',
      port: 5432,
      ssl: false
    });
    
    // Lire le fichier SQL
    const sqlContent = fs.readFileSync('create-tables.sql', 'utf8');
    
    // Diviser en requêtes individuelles
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'));
    
    console.log(`📝 ${queries.length} requêtes à exécuter...\n`);
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query.trim()) {
        try {
          console.log(`⏳ Exécution requête ${i + 1}...`);
          const result = await pool.query(query);
          
          if (result.rows) {
            console.log(`✅ Requête ${i + 1} exécutée (${result.rows.length} lignes)`);
            if (result.rows.length > 0) {
              console.log('   Résultat:', result.rows);
            }
          } else {
            console.log(`✅ Requête ${i + 1} exécutée`);
          }
        } catch (error) {
          console.log(`⚠️  Erreur requête ${i + 1}:`, error.message);
        }
      }
    }
    
    console.log('\n📋 Vérification des tables créées...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`✅ ${tablesResult.rows.length} tables dans la base de données:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    await pool.end();
    console.log('\n🎉 Tables créées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

executeSQL();



