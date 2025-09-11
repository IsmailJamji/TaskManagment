// Test de debug pour l'IA
import http from 'http';
import fs from 'fs';

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testDebugAI() {
  console.log('🔍 Test de debug de l\'IA...\n');

  try {
    // 1. Connexion
    console.log('1️⃣ Connexion...');
    const loginResult = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@taskforge.com',
      password: 'admin123'
    });
    
    if (loginResult.status !== 200) {
      console.log('❌ Échec de la connexion');
      return;
    }
    
    const token = loginResult.data.token;
    console.log('✅ Connexion réussie');

    // 2. Créer un fichier Excel de test simple
    console.log('\n2️⃣ Création d\'un fichier Excel simple...');
    const testData = [
      ['Type', 'Marque', 'Modèle', 'Propriétaire', 'Date'],
      ['laptop', 'Dell', 'Inspiron 15', 'Ahmed Benali', '2024-01-15'],
      ['desktop', 'HP', 'Pavilion', 'Sara Alami', '2024-01-16']
    ];

    const csvContent = testData.map(row => row.join(',')).join('\n');
    fs.writeFileSync('test-debug.csv', csvContent);
    console.log('✅ Fichier CSV créé:');
    console.log(csvContent);

    // 3. Tester l'import avec debug
    console.log('\n3️⃣ Test de l\'import avec debug...');
    
    // Simuler l'import en créant des données directement
    const importData = {
      type: 'laptop',
      marque: 'Dell',
      modele: 'Inspiron 15',
      serial_number: 'DL123456',
      specifications: {},
      proprietaire: 'Ahmed Benali',
      ville_societe: '',
      poste: '',
      departement: 'Non spécifié',
      est_premiere_main: true,
      date_acquisition: '2024-01-15'
    };

    const createResult = await makeRequest('/api/parc-informatique', 'POST', importData, token);
    console.log('Status:', createResult.status);
    
    if (createResult.status === 201) {
      console.log('✅ Élément créé avec succès');
      console.log('ID:', createResult.data.id);
      console.log('Marque:', createResult.data.marque);
      console.log('Type:', createResult.data.type);
    } else {
      console.log('❌ Erreur création:', createResult.data);
    }

    // 4. Vérifier la liste
    console.log('\n4️⃣ Vérification de la liste...');
    const listResult = await makeRequest('/api/parc-informatique?limit=5', 'GET', null, token);
    console.log('Status:', listResult.status);
    
    if (listResult.status === 200) {
      console.log('✅ Liste récupérée');
      console.log('Total éléments:', listResult.data.pagination.totalItems);
      console.log('Éléments dans cette page:', listResult.data.items.length);
      
      listResult.data.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.marque} ${item.modele} - ${item.proprietaire}`);
      });
    }

    // 5. Nettoyer
    console.log('\n5️⃣ Nettoyage...');
    if (fs.existsSync('test-debug.csv')) {
      fs.unlinkSync('test-debug.csv');
      console.log('✅ Fichier de test supprimé');
    }

    console.log('\n🎉 Test de debug terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testDebugAI();


