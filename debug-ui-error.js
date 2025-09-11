// Script pour déboguer les erreurs de l'interface utilisateur
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

async function debugUIError() {
  console.log('🔍 Débogage des erreurs de l\'interface utilisateur...\n');

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

    // 2. Test avec des données exactement comme dans l'UI
    console.log('\n2️⃣ Test avec données UI (Parc Informatique)...');
    
    // Données exactement comme dans le formulaire UI
    const uiData = {
      type: 'laptop',
      marque: 'HP',
      modele: 'Pavilion 15',
      serial_number: 'HP123456789',
      specifications: {
        disque_dur: '1TB HDD',
        processeur: 'Intel i7',
        ram: '16GB',
        os: 'Windows 11',
        autres: 'Webcam intégrée'
      },
      proprietaire: 'Ahmed Benali',
      departement: 'IT',
      est_premiere_main: true,
      date_acquisition: '2024-01-15'
    };
    
    console.log('📤 Données envoyées:', JSON.stringify(uiData, null, 2));
    
    const result = await makeRequest('/api/parc-informatique', 'POST', uiData, token);
    console.log(`📥 Status: ${result.status}`);
    console.log('📥 Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 201) {
      console.log('✅ Sauvegarde réussie !');
    } else {
      console.log('❌ Erreur de sauvegarde');
      
      // Analyser l'erreur
      if (result.data && result.data.error) {
        console.log('🔍 Détail de l\'erreur:', result.data.error);
      }
    }

    // 3. Test Parc Télécom
    console.log('\n3️⃣ Test avec données UI (Parc Télécom)...');
    
    const telecomData = {
      numero_puce: '212612345679',
      operateur: 'inwi',
      proprietaire: 'Fatima Alami',
      departement: 'Ventes',
      specifications: {
        forfait: '50GB',
        type: 'Data + Voice'
      }
    };
    
    console.log('📤 Données envoyées:', JSON.stringify(telecomData, null, 2));
    
    const telecomResult = await makeRequest('/api/parc-telecom', 'POST', telecomData, token);
    console.log(`📥 Status: ${telecomResult.status}`);
    console.log('📥 Response:', JSON.stringify(telecomResult.data, null, 2));
    
    if (telecomResult.status === 201) {
      console.log('✅ Sauvegarde télécom réussie !');
    } else {
      console.log('❌ Erreur de sauvegarde télécom');
    }

    // 4. Vérifier les données finales
    console.log('\n4️⃣ Vérification finale...');
    const finalCheck = await makeRequest('/api/parc-informatique', 'GET', null, token);
    console.log(`Parc Informatique: ${finalCheck.data.length} éléments`);
    
    const finalCheckTelecom = await makeRequest('/api/parc-telecom', 'GET', null, token);
    console.log(`Parc Télécom: ${finalCheckTelecom.data.length} éléments`);

  } catch (error) {
    console.error('❌ Erreur lors du débogage:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugUIError();



