// Test simple pour identifier l'erreur 500
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

async function testSimple() {
  console.log('🔍 Test simple pour identifier l\'erreur...\n');

  try {
    // 1. Connexion
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

    // 2. Test avec données minimales
    console.log('\n2️⃣ Test avec données minimales...');
    const minimalData = {
      type: 'laptop',
      marque: 'Test',
      proprietaire: 'Test User',
      date_acquisition: '2024-01-01'
    };
    
    console.log('📤 Données:', JSON.stringify(minimalData, null, 2));
    
    const result = await makeRequest('/api/parc-informatique', 'POST', minimalData, token);
    console.log(`📥 Status: ${result.status}`);
    console.log('📥 Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 201) {
      console.log('✅ Succès !');
    } else {
      console.log('❌ Échec');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testSimple();



