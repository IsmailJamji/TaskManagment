// Test pour vérifier la connexion frontend-backend
import http from 'http';

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

async function testFrontendConnection() {
  console.log('🔍 Test de connexion frontend-backend...\n');

  try {
    // 1. Test de connexion
    console.log('1️⃣ Test de connexion...');
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

    // 2. Test avec les données exactes de l'image
    console.log('\n2️⃣ Test avec les données de l\'image...');
    const imageData = {
      type: 'laptop', // Type par défaut
      marque: 'Test', // Marque requise
      proprietaire: 'ismail', // Nom du propriétaire de l'image
      date_acquisition: '2025-09-09', // Date de l'image
      specifications: {
        processeur: 'i7',
        ram: '16',
        disque_dur: '512',
        os: 'windows10',
        autres: 'ccc'
      },
      est_premiere_main: true
    };
    
    console.log('📤 Données envoyées:', JSON.stringify(imageData, null, 2));
    
    const result = await makeRequest('/api/parc-informatique', 'POST', imageData, token);
    console.log(`📥 Status: ${result.status}`);
    console.log('📥 Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 201) {
      console.log('✅ Sauvegarde réussie !');
      console.log('💡 Le problème est côté frontend, pas côté API');
    } else {
      console.log('❌ Erreur de sauvegarde');
      console.log('🔍 Détail de l\'erreur:', result.data);
    }

    // 3. Vérification des données
    console.log('\n3️⃣ Vérification des données...');
    const checkResult = await makeRequest('/api/parc-informatique', 'GET', null, token);
    console.log(`📊 ${checkResult.data.length} éléments dans la base`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testFrontendConnection();



