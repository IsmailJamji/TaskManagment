// Script pour diagnostiquer l'erreur exacte
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
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
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

async function debugExactError() {
  console.log('🔍 Diagnostic précis de l\'erreur...\n');

  try {
    // 1. Test de connexion
    console.log('1️⃣ Test de connexion...');
    const loginResult = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@taskforge.com',
      password: 'admin123'
    });
    
    if (loginResult.status !== 200) {
      console.log('❌ Échec de la connexion:', loginResult.data);
      return;
    }
    
    const token = loginResult.data.token;
    console.log('✅ Connexion réussie');

    // 2. Test avec données exactes du formulaire
    console.log('\n2️⃣ Test avec données exactes du formulaire...');
    
    // Données exactement comme dans le formulaire de l'image
    const formData = {
      type: 'laptop',
      marque: 'Test',
      modele: '',
      serial_number: '',
      specifications: {
        disque_dur: '512',
        processeur: 'i7',
        ram: '16',
        os: 'windows10',
        autres: 'ccc'
      },
      proprietaire: 'ismail',
      departement: '',
      est_premiere_main: true,
      date_acquisition: '2025-09-09'
    };
    
    console.log('📤 Données envoyées:', JSON.stringify(formData, null, 2));
    
    const result = await makeRequest('/api/parc-informatique', 'POST', formData, token);
    console.log(`📥 Status: ${result.status}`);
    console.log('📥 Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 201) {
      console.log('✅ API fonctionne parfaitement !');
      console.log('💡 Le problème est dans l\'interface utilisateur');
    } else {
      console.log('❌ Erreur API:', result.data);
    }

    // 3. Test de récupération des données
    console.log('\n3️⃣ Test de récupération...');
    const getResult = await makeRequest('/api/parc-informatique', 'GET', null, token);
    console.log(`📊 ${getResult.data.length} éléments dans la base`);

    // 4. Test de l'URL du frontend
    console.log('\n4️⃣ Test de l\'URL frontend...');
    try {
      const frontendTest = await makeRequest('/', 'GET', null, null);
      console.log('Frontend accessible:', frontendTest.status);
    } catch (e) {
      console.log('Frontend non accessible sur port 3001 (normal)');
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
  }
}

debugExactError();



