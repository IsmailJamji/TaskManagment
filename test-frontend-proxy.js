// Test du proxy frontend
import http from 'http';

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5173, // Port du frontend
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

async function testFrontendProxy() {
  console.log('🔍 Test du proxy frontend...\n');

  try {
    // 1. Test de connexion via proxy
    console.log('1️⃣ Test de connexion via proxy frontend...');
    const loginResult = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@taskforge.com',
      password: 'admin123'
    });
    
    console.log(`Status: ${loginResult.status}`);
    console.log('Response:', loginResult.data);
    
    if (loginResult.status !== 200) {
      console.log('❌ Échec de la connexion via proxy');
      return;
    }
    
    const token = loginResult.data.token;
    console.log('✅ Connexion via proxy réussie');

    // 2. Test d'ajout via proxy
    console.log('\n2️⃣ Test d\'ajout via proxy...');
    const testData = {
      type: 'laptop',
      marque: 'Test Proxy',
      proprietaire: 'Test User',
      date_acquisition: '2024-01-01'
    };
    
    const addResult = await makeRequest('/api/parc-informatique', 'POST', testData, token);
    console.log(`Status: ${addResult.status}`);
    console.log('Response:', addResult.data);
    
    if (addResult.status === 201) {
      console.log('✅ Ajout via proxy réussi !');
    } else {
      console.log('❌ Échec de l\'ajout via proxy');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test proxy:', error.message);
  }
}

testFrontendProxy();



