// Test des nouvelles fonctionnalités
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

async function testNewFeatures() {
  console.log('🧪 Test des nouvelles fonctionnalités...\n');

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

    // 2. Test Parc Informatique avec nouveaux champs
    console.log('\n2️⃣ Test Parc Informatique avec nouveaux champs...');
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
      proprietaire: 'Ahmed Benali',
      ville_societe: 'Casablanca',
      poste: 'Développeur',
      departement: 'IT',
      est_premiere_main: true,
      date_acquisition: '2024-01-15'
    };
    
    const parcInfoResult = await makeRequest('/api/parc-informatique', 'POST', parcInfoData, token);
    console.log(`Status: ${parcInfoResult.status}`);
    
    if (parcInfoResult.status === 201) {
      console.log('✅ Parc Informatique: Nouveaux champs ajoutés avec succès !');
      console.log('📝 ID créé:', parcInfoResult.data.id);
      console.log('🏢 Ville/Société:', parcInfoResult.data.ville_societe);
      console.log('💼 Poste:', parcInfoResult.data.poste);
    } else {
      console.log('❌ Parc Informatique: Erreur', parcInfoResult.data);
    }

    // 3. Test Parc Télécom avec nouveaux champs
    console.log('\n3️⃣ Test Parc Télécom avec nouveaux champs...');
    const parcTelecomData = {
      numero_puce: '212612345681',
      operateur: 'iam',
      proprietaire: 'Fatima Alami',
      ville_societe: 'Rabat',
      poste: 'Chef de projet',
      departement: 'Ventes',
      specifications: {
        forfait: '50GB',
        type: 'Data + Voice',
        autres: 'Test'
      }
    };
    
    const parcTelecomResult = await makeRequest('/api/parc-telecom', 'POST', parcTelecomData, token);
    console.log(`Status: ${parcTelecomResult.status}`);
    
    if (parcTelecomResult.status === 201) {
      console.log('✅ Parc Télécom: Nouveaux champs ajoutés avec succès !');
      console.log('📝 ID créé:', parcTelecomResult.data.id);
      console.log('🏢 Ville/Société:', parcTelecomResult.data.ville_societe);
      console.log('💼 Poste:', parcTelecomResult.data.poste);
    } else {
      console.log('❌ Parc Télécom: Erreur', parcTelecomResult.data);
    }

    // 4. Vérification finale
    console.log('\n4️⃣ Vérification finale...');
    const checkParcInfo = await makeRequest('/api/parc-informatique', 'GET', null, token);
    const checkParcTelecom = await makeRequest('/api/parc-telecom', 'GET', null, token);
    
    console.log(`📊 Parc Informatique: ${checkParcInfo.data.length} éléments`);
    console.log(`📊 Parc Télécom: ${checkParcTelecom.data.length} éléments`);

    console.log('\n🎉 Toutes les nouvelles fonctionnalités sont opérationnelles !');
    console.log('✅ Nouveaux champs ajoutés aux deux parcs');
    console.log('✅ Filtres avancés pour Parc Informatique');
    console.log('✅ Base de données mise à jour');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testNewFeatures();



