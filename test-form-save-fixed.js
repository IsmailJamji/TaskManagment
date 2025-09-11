// Test de sauvegarde du formulaire avec date ISO
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

async function testFormSaveFixed() {
  console.log('🔧 Test de sauvegarde du formulaire avec date ISO...\n');

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

    // 2. Test de création d'un équipement avec date ISO
    console.log('\n2️⃣ Test de création d\'un équipement...');
    const equipmentData = {
      type: 'laptop',
      marque: 'Dell',
      modele: 'Inspiron 15',
      serial_number: 'SN-TEST-001',
      specifications: {
        disque_dur: '512GB SSD',
        processeur: 'Intel i7',
        ram: '16GB',
        os: 'Windows 11',
        autres: 'Test equipment'
      },
      proprietaire: 'ismail',
      ville_societe: 'Casablanca',
      poste: 'Développeur',
      departement: 'IT',
      est_premiere_main: true,
      date_acquisition: '2023-01-15T00:00:00.000Z' // Date ISO
    };

    console.log('Données envoyées:', JSON.stringify(equipmentData, null, 2));

    const createResult = await makeRequest('/api/parc-informatique', 'POST', equipmentData, token);
    console.log('Status:', createResult.status);
    console.log('Response:', JSON.stringify(createResult.data, null, 2));
    
    if (createResult.status === 201) {
      console.log('✅ Équipement créé avec succès !');
      console.log('ID:', createResult.data.id);
      console.log('Type:', createResult.data.type);
      console.log('Marque:', createResult.data.marque);
      console.log('Propriétaire:', createResult.data.proprietaire);
    } else {
      console.log('❌ Erreur création équipement:', createResult.data);
    }

    // 3. Test avec date simple
    console.log('\n3️⃣ Test avec date simple...');
    const equipmentData2 = {
      type: 'imprimante',
      marque: 'HP',
      modele: 'LaserJet Pro',
      serial_number: 'SN-PRINTER-001',
      specifications: {
        disque_dur: '1TB HDD',
        processeur: 'ARM',
        ram: '4GB',
        os: 'Linux',
        autres: 'Imprimante réseau'
      },
      proprietaire: 'Ahmed',
      ville_societe: 'Rabat',
      poste: 'Secrétaire',
      departement: 'RH',
      est_premiere_main: true,
      date_acquisition: '2023-02-20' // Date simple
    };

    const createResult2 = await makeRequest('/api/parc-informatique', 'POST', equipmentData2, token);
    console.log('Status:', createResult2.status);
    console.log('Response:', JSON.stringify(createResult2.data, null, 2));
    
    if (createResult2.status === 201) {
      console.log('✅ Imprimante créée avec succès !');
      console.log('ID:', createResult2.data.id);
      console.log('Type:', createResult2.data.type);
      console.log('Marque:', createResult2.data.marque);
      console.log('Propriétaire:', createResult2.data.proprietaire);
    } else {
      console.log('❌ Erreur création imprimante:', createResult2.data);
    }

    console.log('\n🎉 Test de sauvegarde du formulaire terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testFormSaveFixed();


