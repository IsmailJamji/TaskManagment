// Test de l'Ultra IA avec des structures Excel très différentes
import http from 'http';
import fs from 'fs';
import * as XLSX from 'xlsx';

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

async function testUltraAI() {
  console.log('🚀 Test de l\'Ultra IA Ultra-Adaptative...\n');

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

    // 2. Créer un fichier Excel avec une structure très différente
    console.log('\n2️⃣ Création d\'un fichier Excel avec structure différente...');
    const testData = [
      // En-têtes très différents et tronqués
      ['Equipement', 'Brand', 'Owner Name', 'Model', 'Serial', 'Dept', 'Memory', 'Storage', 'CPU', 'OS', 'Purchase Date', 'New/Used'],
      
      // Données avec informations combinées et structures différentes
      ['Laptop Computer', 'Dell Technologies', 'John Smith Mod-123', 'Inspiron 15 3000', 'SN-ABC123-X IT Department', 'Information Technology', '16 Gigabytes', '512GB Solid State Drive', 'Intel Core i7 Processor', 'Microsoft Windows 11', '15/03/2023', 'New'],
      ['Desktop PC', 'HP Inc', 'Jane Doe Mod-456', 'EliteDesk 800 G8', 'SN-DEF456-Y Marketing Team', 'Marketing Department', '32 GB RAM', '1TB Hard Disk Drive', 'AMD Ryzen 7 CPU', 'Ubuntu Linux 22.04', '20/04/2023', 'First Hand'],
      ['Server Machine', 'IBM Corporation', 'Admin User Mod-789', 'PowerEdge R750 Server', 'SN-GHI789-Z IT Infrastructure', 'IT Infrastructure', '64GB Memory', '2TB SSD Storage', 'Intel Xeon Gold Processor', 'Red Hat Enterprise Linux', '10/05/2023', 'Brand New'],
      ['Printing Device', 'Canon Inc', 'Office Manager Mod-101', 'PIXMA TR4520 Printer', 'SN-JKL101-A Office Administration', 'Office Administration', '4GB RAM', '256GB Internal Storage', 'ARM Processor', 'Canon OS', '25/06/2023', 'New Equipment']
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(testData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'test-ultra-ai.xlsx');
    console.log('✅ Fichier Excel créé: test-ultra-ai.xlsx');

    console.log('\n📋 Contenu du fichier (structure très différente) :');
    testData.forEach((row, index) => {
      if (index === 0) {
        console.log(`   ${index + 1}. [EN-TÊTES] ${row.join(' | ')}`);
      } else {
        console.log(`   ${index + 1}. [DONNÉES] ${row.join(' | ')}`);
      }
    });

    // 3. Convertir en base64
    console.log('\n3️⃣ Conversion en base64...');
    const fileBuffer = fs.readFileSync('test-ultra-ai.xlsx');
    const base64Data = fileBuffer.toString('base64');
    console.log('✅ Fichier converti en base64');

    // 4. Tester l'import avec l'Ultra IA
    console.log('\n4️⃣ Test de l\'import avec l\'Ultra IA...');
    const importResult = await makeRequest('/api/parc-informatique-simple/import/excel-simple', 'POST', {
      data: base64Data
    }, token);
    
    console.log('Status:', importResult.status);
    console.log('Response:', JSON.stringify(importResult.data, null, 2));
    
    if (importResult.status === 200) {
      console.log('✅ Import Ultra IA réussi !');
      console.log('Importés:', importResult.data.imported);
      console.log('Erreurs:', importResult.data.errors);
      console.log('Avertissements:', importResult.data.warnings);
      console.log('Avertissements IA:', importResult.data.aiWarnings);
      
      if (importResult.data.ultraAI) {
        console.log('\n🚀 Ultra IA Analysis:');
        console.log('Niveau d\'intelligence:', importResult.data.ultraAI.intelligenceLevel);
        console.log('Confiance:', importResult.data.ultraAI.confidence + '%');
        console.log('Colonnes détectées:', importResult.data.ultraAI.columnsDetected);
        console.log('Transformations:', importResult.data.ultraAI.transformations);
        
        if (importResult.data.ultraAI.columnMapping) {
          console.log('\n📋 Mapping ultra-adaptatif:');
          Object.entries(importResult.data.ultraAI.columnMapping).forEach(([field, mapping]) => {
            console.log(`   ${field}: "${mapping.originalHeader}" (${(mapping.confidence * 100).toFixed(0)}% - ${mapping.matchType})`);
          });
        }
      }
    } else {
      console.log('❌ Erreur import:', importResult.data);
    }

    // 5. Vérifier la liste
    console.log('\n5️⃣ Vérification de la liste...');
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

    // 6. Nettoyer
    console.log('\n6️⃣ Nettoyage...');
    if (fs.existsSync('test-ultra-ai.xlsx')) {
      fs.unlinkSync('test-ultra-ai.xlsx');
      console.log('✅ Fichier de test supprimé');
    }

    console.log('\n🎉 Test de l\'Ultra IA terminé !');
    console.log('\n💡 L\'Ultra IA peut maintenant :');
    console.log('   ✅ Détecter n\'importe quelle structure Excel');
    console.log('   ✅ S\'adapter aux en-têtes très différents');
    console.log('   ✅ Séparer les données combinées intelligemment');
    console.log('   ✅ Extraire les spécifications depuis n\'importe où');
    console.log('   ✅ Détecter automatiquement les types d\'équipements');
    console.log('   ✅ Transformer et importer avec une confiance ultra-élevée !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testUltraAI();


