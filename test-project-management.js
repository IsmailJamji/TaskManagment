// Test de la Gestion de Projet
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

async function testProjectManagement() {
  console.log('🧪 Test de la Gestion de Projet...\n');

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

    // 2. Vérifier les utilisateurs disponibles
    console.log('\n2️⃣ Vérification des utilisateurs...');
    const usersResult = await makeRequest('/api/users', 'GET', null, token);
    console.log(`Status: ${usersResult.status}`);
    console.log(`Utilisateurs disponibles: ${usersResult.data.length}`);
    
    if (usersResult.data.length === 0) {
      console.log('⚠️ Aucun utilisateur trouvé. Création d\'un utilisateur de test...');
      
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
        department: 'IT'
      };
      
      const createUserResult = await makeRequest('/api/users', 'POST', newUser, token);
      if (createUserResult.status === 201) {
        console.log('✅ Utilisateur de test créé');
      }
    }

    // 3. Test création de projet
    console.log('\n3️⃣ Test création de projet...');
    const projetData = {
      nom: 'Projet Test',
      description: 'Description du projet test',
      chef_projet_id: 1, // Admin user
      date_debut: '2024-01-01',
      date_fin_prevue: '2024-12-31',
      statut: 'planifie',
      priorite: 'high',
      budget: 50000,
      equipe_ids: [1] // Admin user
    };
    
    const projetResult = await makeRequest('/api/projets', 'POST', projetData, token);
    console.log(`Status: ${projetResult.status}`);
    
    if (projetResult.status === 201) {
      console.log('✅ Projet créé avec succès !');
      console.log('📝 ID du projet:', projetResult.data.id);
      
      const projetId = projetResult.data.id;
      
      // 4. Test création de sous-tâche
      console.log('\n4️⃣ Test création de sous-tâche...');
      const sousTacheData = {
        nom: 'Sous-tâche Test',
        description: 'Description de la sous-tâche',
        assigne_id: 1, // Admin user
        date_debut: '2024-01-01',
        date_fin_prevue: '2024-06-30',
        statut: 'not_started',
        priorite: 'medium',
        progression: 0
      };
      
      const sousTacheResult = await makeRequest(`/api/projets/${projetId}/sous-taches`, 'POST', sousTacheData, token);
      console.log(`Status: ${sousTacheResult.status}`);
      
      if (sousTacheResult.status === 201) {
        console.log('✅ Sous-tâche créée avec succès !');
        console.log('📝 ID de la sous-tâche:', sousTacheResult.data.id);
      } else {
        console.log('❌ Erreur création sous-tâche:', sousTacheResult.data);
      }
      
    } else {
      console.log('❌ Erreur création projet:', projetResult.data);
    }

    // 5. Vérification finale
    console.log('\n5️⃣ Vérification finale...');
    const projetsResult = await makeRequest('/api/projets', 'GET', null, token);
    console.log(`📊 Projets: ${projetsResult.data.length} trouvés`);

    console.log('\n🎉 Test de la Gestion de Projet terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testProjectManagement();



