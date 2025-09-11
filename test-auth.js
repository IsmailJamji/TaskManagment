// Script pour tester l'authentification et obtenir un token valide
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

async function testAuthAndParc() {
  console.log('🔐 Test d\'authentification et des parcs...\n');

  try {
    // Test 1: Connexion avec l'admin par défaut
    console.log('1️⃣ Connexion avec l\'admin par défaut...');
    const loginData = {
      email: 'admin@taskforge.com',
      password: 'admin123'
    };
    
    const loginResult = await makeRequest('/api/auth/login', 'POST', loginData);
    console.log(`   Status: ${loginResult.status}`);
    console.log(`   Response:`, loginResult.data);
    
    if (loginResult.status !== 200) {
      console.log('   ❌ Échec de la connexion');
      return;
    }
    
    const token = loginResult.data.token;
    console.log('   ✅ Connexion réussie, token obtenu');

    // Test 2: Test Parc Informatique avec token valide
    console.log('\n2️⃣ Test Parc Informatique avec authentification...');
    const parcInfoData = {
      type: 'laptop',
      marque: 'Dell',
      proprietaire: 'Test User',
      date_acquisition: '2024-01-01'
    };
    
    const parcInfoResult = await makeRequest('/api/parc-informatique', 'POST', parcInfoData, token);
    console.log(`   Status: ${parcInfoResult.status}`);
    console.log(`   Response:`, parcInfoResult.data);
    
    if (parcInfoResult.status === 201) {
      console.log('   ✅ Parc Informatique: Sauvegarde réussie');
    } else {
      console.log('   ❌ Parc Informatique: Erreur de sauvegarde');
    }

    // Test 3: Test Parc Télécom avec token valide
    console.log('\n3️⃣ Test Parc Télécom avec authentification...');
    const parcTelecomData = {
      numero_puce: '212612345678',
      operateur: 'iam',
      proprietaire: 'Test User'
    };
    
    const parcTelecomResult = await makeRequest('/api/parc-telecom', 'POST', parcTelecomData, token);
    console.log(`   Status: ${parcTelecomResult.status}`);
    console.log(`   Response:`, parcTelecomResult.data);
    
    if (parcTelecomResult.status === 201) {
      console.log('   ✅ Parc Télécom: Sauvegarde réussie');
    } else {
      console.log('   ❌ Parc Télécom: Erreur de sauvegarde');
    }

    // Test 4: Vérifier les données sauvegardées
    console.log('\n4️⃣ Vérification des données sauvegardées...');
    const checkParcInfo = await makeRequest('/api/parc-informatique', 'GET', null, token);
    console.log(`   Parc Informatique - Status: ${checkParcInfo.status}`);
    if (checkParcInfo.status === 200) {
      console.log(`   Nombre d'éléments: ${checkParcInfo.data.length}`);
    }
    
    const checkParcTelecom = await makeRequest('/api/parc-telecom', 'GET', null, token);
    console.log(`   Parc Télécom - Status: ${checkParcTelecom.status}`);
    if (checkParcTelecom.status === 200) {
      console.log(`   Nombre d'éléments: ${checkParcTelecom.data.length}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testAuthAndParc();



