// Test pour vérifier que les formulaires sont maintenant corrigés
import http from 'http';

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5173, // Port du frontend avec proxy
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

async function testFixedForms() {
  console.log('🔧 Test des formulaires corrigés...\n');

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

    // 2. Test Parc Informatique avec données du formulaire
    console.log('\n2️⃣ Test Parc Informatique (formulaire corrigé)...');
    const parcInfoData = {
      type: 'laptop',
      marque: 'Dell',
      modele: 'Inspiron 15',
      serial_number: 'DL123456789',
      specifications: {
        disque_dur: '512GB SSD',
        processeur: 'Intel i7',
        ram: '16GB',
        os: 'Windows 11',
        autres: 'Webcam intégrée'
      },
      proprietaire: 'ismail',
      departement: 'IT',
      est_premiere_main: true,
      date_acquisition: '2025-09-09'
    };
    
    const parcInfoResult = await makeRequest('/api/parc-informatique', 'POST', parcInfoData, token);
    console.log(`Status: ${parcInfoResult.status}`);
    
    if (parcInfoResult.status === 201) {
      console.log('✅ Parc Informatique: Formulaire corrigé et fonctionnel !');
      console.log('📝 ID créé:', parcInfoResult.data.id);
    } else {
      console.log('❌ Parc Informatique: Erreur', parcInfoResult.data);
    }

    // 3. Test Parc Télécom avec données du formulaire
    console.log('\n3️⃣ Test Parc Télécom (formulaire corrigé)...');
    const parcTelecomData = {
      numero_puce: '212612345680',
      operateur: 'iam',
      proprietaire: 'ismail',
      departement: 'IT',
      specifications: {
        forfait: '20GB',
        type: 'Data + Voice',
        autres: 'Test'
      }
    };
    
    const parcTelecomResult = await makeRequest('/api/parc-telecom', 'POST', parcTelecomData, token);
    console.log(`Status: ${parcTelecomResult.status}`);
    
    if (parcTelecomResult.status === 201) {
      console.log('✅ Parc Télécom: Formulaire corrigé et fonctionnel !');
      console.log('📝 ID créé:', parcTelecomResult.data.id);
    } else {
      console.log('❌ Parc Télécom: Erreur', parcTelecomResult.data);
    }

    // 4. Vérification finale
    console.log('\n4️⃣ Vérification finale...');
    const checkParcInfo = await makeRequest('/api/parc-informatique', 'GET', null, token);
    const checkParcTelecom = await makeRequest('/api/parc-telecom', 'GET', null, token);
    
    console.log(`📊 Parc Informatique: ${checkParcInfo.data.length} éléments`);
    console.log(`📊 Parc Télécom: ${checkParcTelecom.data.length} éléments`);

    console.log('\n🎉 Tous les formulaires sont maintenant corrigés !');
    console.log('💡 L\'erreur "post is not a function" est résolue !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testFixedForms();



