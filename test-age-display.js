// Test de l'affichage de l'âge dans Parc Informatique
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

async function testAgeDisplay() {
  console.log('🧪 Test de l\'affichage de l\'âge...\n');

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

    // 2. Vérifier les éléments du parc informatique
    console.log('\n2️⃣ Vérification des éléments du parc informatique...');
    const parcResult = await makeRequest('/api/parc-informatique', 'GET', null, token);
    console.log(`Status: ${parcResult.status}`);
    console.log(`Éléments trouvés: ${parcResult.data.length}`);
    
    if (parcResult.data.length > 0) {
      console.log('\n📊 Détails des éléments:');
      parcResult.data.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.marque} ${item.modele}`);
        console.log(`   - Date d'acquisition: ${item.date_acquisition}`);
        console.log(`   - Âge calculé: ${item.age_ans} ans`);
        console.log(`   - Est ancien: ${item.est_ancien}`);
        console.log(`   - Propriétaire: ${item.proprietaire}`);
        console.log(`   - Ville/Société: ${item.ville_societe || 'Non spécifié'}`);
        console.log(`   - Poste: ${item.poste || 'Non spécifié'}`);
      });
    } else {
      console.log('⚠️ Aucun élément trouvé dans le parc informatique');
    }

    console.log('\n🎉 Test terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testAgeDisplay();
