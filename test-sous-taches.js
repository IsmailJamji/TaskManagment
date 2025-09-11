// Test des améliorations des sous-tâches
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

async function testSousTaches() {
  console.log('🧪 Test des améliorations des sous-tâches...\n');

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

    // 2. Créer un projet de test
    console.log('\n2️⃣ Création d\'un projet de test...');
    const projetData = {
      nom: 'Test Sous-tâches',
      description: 'Projet pour tester les sous-tâches',
      chef_projet_id: 1,
      date_debut: '2024-01-01',
      date_fin_prevue: '2024-12-31',
      statut: 'planifie',
      priorite: 'medium',
      budget: 50000,
      equipe_ids: [1]
    };

    const projetResult = await makeRequest('/api/projets', 'POST', projetData, token);
    console.log(`Status: ${projetResult.status}`);
    
    if (projetResult.status !== 201) {
      console.log('❌ Erreur création projet:', projetResult.data);
      return;
    }
    
    const projetId = projetResult.data.id;
    console.log('✅ Projet créé avec ID:', projetId);

    // 3. Créer plusieurs sous-tâches
    console.log('\n3️⃣ Création de sous-tâches...');
    const sousTaches = [
      {
        nom: 'Sous-tâche 1',
        description: 'Première sous-tâche',
        assigne_id: 1,
        date_debut: '2024-01-01',
        date_fin_prevue: '2024-01-15',
        statut: 'not_started',
        priorite: 'high',
        progression: 0
      },
      {
        nom: 'Sous-tâche 2',
        description: 'Deuxième sous-tâche',
        assigne_id: 1,
        date_debut: '2024-01-16',
        date_fin_prevue: '2024-01-30',
        statut: 'not_started',
        priorite: 'medium',
        progression: 0
      },
      {
        nom: 'Sous-tâche 3',
        description: 'Troisième sous-tâche',
        assigne_id: 1,
        date_debut: '2024-02-01',
        date_fin_prevue: '2024-02-15',
        statut: 'not_started',
        priorite: 'low',
        progression: 0
      }
    ];

    const sousTacheIds = [];
    for (let i = 0; i < sousTaches.length; i++) {
      const sousTache = sousTaches[i];
      const result = await makeRequest(`/api/projets/${projetId}/sous-taches`, 'POST', {
        ...sousTache,
        projet_id: projetId
      }, token);
      
      if (result.status === 201) {
        sousTacheIds.push(result.data.id);
        console.log(`✅ Sous-tâche ${i + 1} créée avec ID: ${result.data.id}`);
      } else {
        console.log(`❌ Erreur création sous-tâche ${i + 1}:`, result.data);
      }
    }

    // 4. Vérifier les sous-tâches créées
    console.log('\n4️⃣ Vérification des sous-tâches...');
    const sousTachesResult = await makeRequest(`/api/projets/${projetId}/sous-taches`, 'GET', null, token);
    console.log(`Status: ${sousTachesResult.status}`);
    
    if (sousTachesResult.status === 200) {
      console.log('✅ Sous-tâches récupérées:', sousTachesResult.data.length);
      sousTachesResult.data.forEach((st, index) => {
        console.log(`   ${index + 1}. ${st.nom} - ${st.statut} - ${st.progression}%`);
      });
    }

    // 5. Modifier une sous-tâche
    console.log('\n5️⃣ Modification d\'une sous-tâche...');
    if (sousTacheIds.length > 0) {
      const updateData = {
        nom: 'Sous-tâche 1 Modifiée',
        description: 'Description modifiée',
        assigne_id: 1,
        date_debut: '2024-01-01',
        date_fin_prevue: '2024-01-20',
        statut: 'in_progress',
        priorite: 'high',
        progression: 50
      };

      const updateResult = await makeRequest(`/api/sous-taches/${sousTacheIds[0]}`, 'PUT', updateData, token);
      console.log(`Status: ${updateResult.status}`);
      
      if (updateResult.status === 200) {
        console.log('✅ Sous-tâche modifiée:', updateResult.data.nom);
        console.log('   Progression:', updateResult.data.progression + '%');
        console.log('   Statut:', updateResult.data.statut);
      } else {
        console.log('❌ Erreur modification:', updateResult.data);
      }
    }

    // 6. Supprimer une sous-tâche
    console.log('\n6️⃣ Suppression d\'une sous-tâche...');
    if (sousTacheIds.length > 1) {
      const deleteResult = await makeRequest(`/api/sous-taches/${sousTacheIds[1]}`, 'DELETE', null, token);
      console.log(`Status: ${deleteResult.status}`);
      
      if (deleteResult.status === 200) {
        console.log('✅ Sous-tâche supprimée');
      } else {
        console.log('❌ Erreur suppression:', deleteResult.data);
      }
    }

    // 7. Vérifier l'état final
    console.log('\n7️⃣ Vérification finale...');
    const finalResult = await makeRequest(`/api/projets/${projetId}/sous-taches`, 'GET', null, token);
    console.log(`Status: ${finalResult.status}`);
    
    if (finalResult.status === 200) {
      console.log('✅ Sous-tâches restantes:', finalResult.data.length);
      finalResult.data.forEach((st, index) => {
        console.log(`   ${index + 1}. ${st.nom} - ${st.statut} - ${st.progression}%`);
      });
    }

    // 8. Nettoyer - supprimer le projet de test
    console.log('\n8️⃣ Nettoyage...');
    const deleteProjetResult = await makeRequest(`/api/projets/${projetId}`, 'DELETE', null, token);
    console.log(`Status: ${deleteProjetResult.status}`);
    
    if (deleteProjetResult.status === 200) {
      console.log('✅ Projet de test supprimé');
    }

    console.log('\n🎉 Test des sous-tâches terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testSousTaches();


