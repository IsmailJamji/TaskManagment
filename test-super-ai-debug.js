// Test de debug de la Super IA
import http from 'http';
import fs from 'fs';
import * as XLSX from 'xlsx';

function makeRequest(path, method = 'GET', data = null, token = null, isFormData = false) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {}
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (isFormData) {
      options.headers['Content-Type'] = 'multipart/form-data';
    } else {
      options.headers['Content-Type'] = 'application/json';
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
      req.write(data);
    }
    req.end();
  });
}

async function testSuperAIDebug() {
  console.log('🔍 Test de debug de la Super IA...\n');

  try {
    // 1. Connexion
    console.log('1️⃣ Connexion...');
    const loginResult = await makeRequest('/api/auth/login', 'POST', JSON.stringify({
      email: 'admin@taskforge.com',
      password: 'admin123'
    }));
    
    if (loginResult.status !== 200) {
      console.log('❌ Échec de la connexion:', loginResult.data);
      return;
    }
    
    const token = loginResult.data.token;
    console.log('✅ Connexion réussie');

    // 2. Créer un fichier Excel simple pour test
    console.log('\n2️⃣ Création d\'un fichier Excel simple...');
    const testData = [
      ['Type', 'Marque', 'Propriétaire', 'Modèle', 'S/N', 'Département', 'RAM', 'Disque', 'OS', 'Date'],
      ['Laptop', 'Dell', 'Jean Dupont', 'Inspiron 15', 'SN-1234-A', 'IT', '8GB', '256GB SSD', 'Windows 11', '2023-01-15'],
      ['Imprimante', 'HP', 'Marie Martin', 'LaserJet Pro', 'SN-5678-B', 'RH', '4GB', '1TB HDD', 'Linux', '2023-02-20']
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(testData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'test-debug-simple.xlsx');
    console.log('✅ Fichier Excel simple créé: test-debug-simple.xlsx');

    // 3. Tester l'import avec FormData
    console.log('\n3️⃣ Test de l\'import avec FormData...');
    
    const fileBuffer = fs.readFileSync('test-debug-simple.xlsx');
    const boundary = '----formdata-boundary-' + Math.random().toString(16);
    
    let formData = '';
    formData += `--${boundary}\r\n`;
    formData += `Content-Disposition: form-data; name="file"; filename="test-debug-simple.xlsx"\r\n`;
    formData += `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`;
    
    const formDataBuffer = Buffer.concat([
      Buffer.from(formData, 'utf8'),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
    ]);

    // Tester l'import
    const importResult = await makeRequest('/api/parc-informatique/import/excel', 'POST', formDataBuffer, token, true);
    console.log('Status:', importResult.status);
    console.log('Response:', JSON.stringify(importResult.data, null, 2));
    
    if (importResult.status === 200) {
      console.log('✅ Import Super IA réussi !');
      console.log('Importés:', importResult.data.imported);
      console.log('Erreurs:', importResult.data.errors);
      console.log('Avertissements:', importResult.data.warnings);
      
      if (importResult.data.superAI) {
        console.log('\n🧠 Super IA Analysis:');
        console.log('Niveau d\'intelligence:', importResult.data.superAI.intelligenceLevel);
        console.log('Confiance:', importResult.data.superAI.confidence + '%');
        console.log('Colonnes détectées:', importResult.data.superAI.columnsDetected);
        console.log('Transformations:', importResult.data.superAI.transformations);
      }
    } else {
      console.log('❌ Erreur import:', importResult.data);
    }

    // 4. Vérifier la liste
    console.log('\n4️⃣ Vérification de la liste...');
    const listResult = await makeRequest('/api/parc-informatique?limit=10', 'GET', null, token);
    console.log('Status:', listResult.status);
    
    if (listResult.status === 200) {
      console.log('✅ Liste récupérée');
      console.log('Total éléments:', listResult.data.pagination.totalItems);
      console.log('Éléments dans cette page:', listResult.data.items.length);
      
      listResult.data.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.type} ${item.marque} ${item.modele} - ${item.proprietaire}`);
      });
    }

    // 5. Nettoyer
    console.log('\n5️⃣ Nettoyage...');
    if (fs.existsSync('test-debug-simple.xlsx')) {
      fs.unlinkSync('test-debug-simple.xlsx');
      console.log('✅ Fichier de test supprimé');
    }

    console.log('\n🎉 Test de debug terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testSuperAIDebug();


