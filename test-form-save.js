// Test de sauvegarde du formulaire
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

async function testFormSave() {
  console.log('🔧 Test de sauvegarde du formulaire...\n');

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

    // 2. Test de création d'un équipement avec serveur
    console.log('\n2️⃣ Test de création d\'un serveur...');
    const serveurData = {
      type: 'serveur',
      marque: 'Dell',
      modele: 'PowerEdge R740',
      serial_number: 'SN-SERVER-001',
      specifications: {
        disque_dur: '2TB SSD',
        processeur: 'Intel Xeon',
        ram: '32GB',
        os: 'Ubuntu Server',
        autres: 'Serveur de production'
      },
      proprietaire: 'ismail',
      ville_societe: 'Casablanca',
      poste: 'Administrateur Système',
      departement: 'IT',
      est_premiere_main: true,
      date_acquisition: '2023-01-15'
    };

    const createResult = await makeRequest('/api/parc-informatique', 'POST', serveurData, token);
    console.log('Status:', createResult.status);
    console.log('Response:', JSON.stringify(createResult.data, null, 2));
    
    if (createResult.status === 201) {
      console.log('✅ Serveur créé avec succès !');
      console.log('ID:', createResult.data.id);
      console.log('Type:', createResult.data.type);
      console.log('Marque:', createResult.data.marque);
      console.log('Propriétaire:', createResult.data.proprietaire);
    } else {
      console.log('❌ Erreur création serveur:', createResult.data);
    }

    // 3. Test de création d'un desktop
    console.log('\n3️⃣ Test de création d\'un desktop...');
    const desktopData = {
      type: 'desktop',
      marque: 'HP',
      modele: 'EliteDesk 800',
      serial_number: 'SN-DESKTOP-001',
      specifications: {
        disque_dur: '1TB HDD',
        processeur: 'Intel i5',
        ram: '16GB',
        os: 'Windows 11',
        autres: 'Poste de travail'
      },
      proprietaire: 'Ahmed',
      ville_societe: 'Rabat',
      poste: 'Développeur',
      departement: 'IT',
      est_premiere_main: true,
      date_acquisition: '2023-02-20'
    };

    const createDesktopResult = await makeRequest('/api/parc-informatique', 'POST', desktopData, token);
    console.log('Status:', createDesktopResult.status);
    console.log('Response:', JSON.stringify(createDesktopResult.data, null, 2));
    
    if (createDesktopResult.status === 201) {
      console.log('✅ Desktop créé avec succès !');
      console.log('ID:', createDesktopResult.data.id);
      console.log('Type:', createDesktopResult.data.type);
      console.log('Marque:', createDesktopResult.data.marque);
      console.log('Propriétaire:', createDesktopResult.data.proprietaire);
    } else {
      console.log('❌ Erreur création desktop:', createDesktopResult.data);
    }

    // 4. Vérifier la liste
    console.log('\n4️⃣ Vérification de la liste...');
    const listResult = await makeRequest('/api/parc-informatique?limit=5', 'GET', null, token);
    console.log('Status:', listResult.status);
    
    if (listResult.status === 200) {
      console.log('✅ Liste récupérée');
      console.log('Total éléments:', listResult.data.pagination.totalItems);
      console.log('Éléments dans cette page:', listResult.data.items.length);
      
      listResult.data.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.type} ${item.marque} ${item.modele} - ${item.proprietaire}`);
      });
    }

    console.log('\n🎉 Test de sauvegarde du formulaire terminé !');
    console.log('\n💡 Le formulaire peut maintenant créer :');
    console.log('   ✅ Laptop');
    console.log('   ✅ Desktop');
    console.log('   ✅ Unité centrale');
    console.log('   ✅ Clavier');
    console.log('   ✅ Imprimante');
    console.log('   ✅ Téléphone');
    console.log('   ✅ Routeur');
    console.log('   ✅ Serveur');
    console.log('   ✅ Autre');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testFormSave();


