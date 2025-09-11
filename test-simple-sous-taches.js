// Test simple des sous-tâches
import http from 'http';

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001, // Port du serveur backend
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

async function testSimple() {
  console.log('🧪 Test simple des sous-tâches...\n');

  try {
    // 1. Connexion
    console.log('1️⃣ Connexion...');
    const loginResult = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@taskforge.com',
      password: 'admin123'
    });
    
    console.log('Status:', loginResult.status);
    console.log('Data:', loginResult.data);
    
    if (loginResult.status !== 200) {
      console.log('❌ Échec de la connexion');
      return;
    }
    
    const token = loginResult.data.token;
    console.log('✅ Connexion réussie');

    // 2. Lister les projets
    console.log('\n2️⃣ Liste des projets...');
    const projetsResult = await makeRequest('/api/projets', 'GET', null, token);
    console.log('Status:', projetsResult.status);
    
    if (projetsResult.status === 200) {
      console.log('✅ Projets trouvés:', projetsResult.data.length);
      if (projetsResult.data.length > 0) {
        const projet = projetsResult.data[0];
        console.log('Premier projet:', projet.nom);
        
        // 3. Lister les sous-tâches du premier projet
        console.log('\n3️⃣ Sous-tâches du projet...');
        const sousTachesResult = await makeRequest(`/api/projets/${projet.id}/sous-taches`, 'GET', null, token);
        console.log('Status:', sousTachesResult.status);
        
        if (sousTachesResult.status === 200) {
          console.log('✅ Sous-tâches trouvées:', sousTachesResult.data.length);
          sousTachesResult.data.forEach((st, index) => {
            console.log(`   ${index + 1}. ${st.nom} - ${st.statut}`);
          });
        }
      }
    }

    console.log('\n🎉 Test terminé !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testSimple();
