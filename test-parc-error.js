// Script pour tester et diagnostiquer les erreurs de sauvegarde dans les parcs
import http from 'http';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    };

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

async function testParcErrors() {
  console.log('🔍 Diagnostic des erreurs de sauvegarde dans les parcs...\n');

  try {
    // Test 1: Vérifier la connexion au serveur
    console.log('1️⃣ Test de connexion au serveur...');
    const serverTest = await makeRequest('/api/users');
    console.log(`   Status: ${serverTest.status}`);
    if (serverTest.status === 401) {
      console.log('   ✅ Serveur accessible (erreur d\'auth normale)');
    } else {
      console.log('   ❌ Problème de connexion au serveur');
      return;
    }

    // Test 2: Test Parc Informatique
    console.log('\n2️⃣ Test Parc Informatique...');
    const parcInfoData = {
      type: 'laptop',
      marque: 'Dell',
      proprietaire: 'Test User',
      date_acquisition: '2024-01-01'
    };
    
    const parcInfoResult = await makeRequest('/api/parc-informatique', 'POST', parcInfoData);
    console.log(`   Status: ${parcInfoResult.status}`);
    console.log(`   Response:`, parcInfoResult.data);
    
    if (parcInfoResult.status === 201) {
      console.log('   ✅ Parc Informatique: Sauvegarde réussie');
    } else {
      console.log('   ❌ Parc Informatique: Erreur de sauvegarde');
    }

    // Test 3: Test Parc Télécom
    console.log('\n3️⃣ Test Parc Télécom...');
    const parcTelecomData = {
      numero_puce: '212612345678',
      operateur: 'iam',
      proprietaire: 'Test User'
    };
    
    const parcTelecomResult = await makeRequest('/api/parc-telecom', 'POST', parcTelecomData);
    console.log(`   Status: ${parcTelecomResult.status}`);
    console.log(`   Response:`, parcTelecomResult.data);
    
    if (parcTelecomResult.status === 201) {
      console.log('   ✅ Parc Télécom: Sauvegarde réussie');
    } else {
      console.log('   ❌ Parc Télécom: Erreur de sauvegarde');
    }

    // Test 4: Vérifier les tables dans la base
    console.log('\n4️⃣ Vérification des données dans la base...');
    const checkParcInfo = await makeRequest('/api/parc-informatique');
    console.log(`   Parc Informatique - Status: ${checkParcInfo.status}`);
    
    const checkParcTelecom = await makeRequest('/api/parc-telecom');
    console.log(`   Parc Télécom - Status: ${checkParcTelecom.status}`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testParcErrors();
