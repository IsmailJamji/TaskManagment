// Test de la pagination et des améliorations
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

async function testPagination() {
  console.log('🧪 Test de la pagination et des améliorations...\n');

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

    // 2. Test pagination Parc Informatique
    console.log('\n2️⃣ Test pagination Parc Informatique...');
    const parcResult = await makeRequest('/api/parc-informatique?page=1&limit=5', 'GET', null, token);
    console.log(`Status: ${parcResult.status}`);
    
    if (parcResult.status === 200) {
      console.log('✅ Pagination fonctionne !');
      console.log(`📊 Page: ${parcResult.data.pagination.currentPage}`);
      console.log(`📊 Total pages: ${parcResult.data.pagination.totalPages}`);
      console.log(`📊 Total items: ${parcResult.data.pagination.totalItems}`);
      console.log(`📊 Items per page: ${parcResult.data.pagination.itemsPerPage}`);
      console.log(`📊 Items in this page: ${parcResult.data.items.length}`);
    } else {
      console.log('❌ Erreur pagination:', parcResult.data);
    }

    // 3. Test recherche
    console.log('\n3️⃣ Test recherche...');
    const searchResult = await makeRequest('/api/parc-informatique?search=Dell&page=1&limit=10', 'GET', null, token);
    console.log(`Status: ${searchResult.status}`);
    
    if (searchResult.status === 200) {
      console.log('✅ Recherche fonctionne !');
      console.log(`📊 Résultats trouvés: ${searchResult.data.pagination.totalItems}`);
      console.log(`📊 Items affichés: ${searchResult.data.items.length}`);
    }

    // 4. Test filtres
    console.log('\n4️⃣ Test filtres...');
    const filterResult = await makeRequest('/api/parc-informatique?type=laptop&page=1&limit=10', 'GET', null, token);
    console.log(`Status: ${filterResult.status}`);
    
    if (filterResult.status === 200) {
      console.log('✅ Filtres fonctionnent !');
      console.log(`📊 Laptops trouvés: ${filterResult.data.pagination.totalItems}`);
    }

    // 5. Test tri
    console.log('\n5️⃣ Test tri...');
    const sortResult = await makeRequest('/api/parc-informatique?sortBy=marque&sortOrder=ASC&page=1&limit=5', 'GET', null, token);
    console.log(`Status: ${sortResult.status}`);
    
    if (sortResult.status === 200) {
      console.log('✅ Tri fonctionne !');
      console.log('📊 Premiers éléments triés par marque:');
      sortResult.data.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.marque} ${item.modele || ''}`);
      });
    }

    console.log('\n🎉 Test des améliorations terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testPagination();



