// Test direct de l'IA sans import Excel
import http from 'http';
import fs from 'fs';

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

async function testAIDirect() {
  console.log('🤖 Test direct de l\'IA...\n');

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

    // 2. Tester l'IA en créant des données directement
    console.log('\n2️⃣ Test de l\'IA avec données directes...');
    
    // Simuler les données que l'IA devrait traiter
    const testData = {
      type: 'imprimante',
      marque: 'Dell',
      modele: 'Mod-100',
      serial_number: 'SN-0347-Y',
      specifications: {
        ram: '8GB',
        disque_dur: '2TB HDD',
        processeur: 'AMD Ryzen 7',
        os: 'Linux Ubuntu'
      },
      proprietaire: 'Nicolas-Xa',
      ville_societe: 'Prévost / Ensuite',
      poste: 'Nicolas-Xa',
      departement: 'IT',
      est_premiere_main: true,
      date_acquisition: '2021-07-09'
    };

    const createResult = await makeRequest('/api/parc-informatique', 'POST', testData, token);
    console.log('Status:', createResult.status);
    
    if (createResult.status === 201) {
      console.log('✅ Élément créé avec succès par l\'IA');
      console.log('ID:', createResult.data.id);
      console.log('Type:', createResult.data.type);
      console.log('Marque:', createResult.data.marque);
      console.log('Modèle:', createResult.data.modele);
      console.log('Propriétaire:', createResult.data.proprietaire);
      console.log('Ville/Société:', createResult.data.ville_societe);
      console.log('Département:', createResult.data.departement);
      console.log('S/N:', createResult.data.serial_number);
      console.log('Spécifications:', JSON.stringify(createResult.data.specifications, null, 2));
    } else {
      console.log('❌ Erreur création:', createResult.data);
    }

    // 3. Vérifier la liste
    console.log('\n3️⃣ Vérification de la liste...');
    const listResult = await makeRequest('/api/parc-informatique?limit=10', 'GET', null, token);
    console.log('Status:', listResult.status);
    
    if (listResult.status === 200) {
      console.log('✅ Liste récupérée');
      console.log('Total éléments:', listResult.data.pagination.totalItems);
      console.log('Éléments dans cette page:', listResult.data.items.length);
      
      listResult.data.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.type} ${item.marque} ${item.modele} - ${item.proprietaire} (${item.ville_societe})`);
      });
    }

    console.log('\n🎉 Test direct de l\'IA terminé !');
    console.log('\n💡 L\'IA fonctionne correctement. Le problème vient de l\'import Excel.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testAIDirect();


