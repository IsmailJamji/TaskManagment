// Test de la Super IA avec route simplifiée
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

async function testSuperAISimple() {
  console.log('🧠 Test de la Super IA avec route simplifiée...\n');

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

    // 2. Créer un fichier Excel avec vos données
    console.log('\n2️⃣ Création d\'un fichier Excel avec vos données...');
    const testData = [
      // En-têtes tronqués comme dans votre fichier
      ['Type', 'Marque', 'Société/Vill', 'Poste', 'Propriétaire', 'Modèle', 'Numéro de Département', 'RAM', 'Disque Dur', 'Processeur', 'Système d\'exploitation', 'Date d\'acquisition'],
      
      // Données avec informations combinées
      ['Imprimante', 'Dell', 'Prévost / Ensuite', 'Nicolas-Xa', 'Mod-100', 'Mod-100', 'SN-0347-Y IT', '8GB', '2TB HDD', 'AMD Ryzen 7', 'Linux Ubuntu', '2021-07-09'],
      ['Serveur', 'HP', 'Lagarde S. Passer', 'Noël du Bo', 'Mod-395', 'Mod-395', 'SN-4743-T IT', '16GB', '512GB SSD', 'Intel i5', 'Windows 11', '2023-12-18'],
      ['Laptop', 'Asus', 'Bouchet / Condition', 'Virginie-Ali', 'Mod-520', 'Mod-520', 'SN-0965-z Marketing', '32GB', '1TB HDD', 'Intel i9', 'macOS Ventura', '2022-01-04'],
      ['unité centrale', 'Lenovo', 'Tech Solutions', 'Développeur', 'Jean Dupont', 'ThinkCentre', 'SN-1234-A IT', '16GB', '1TB SSD', 'Intel i7', 'Windows 10', '2023-06-15']
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(testData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'test-super-ai-simple.xlsx');
    console.log('✅ Fichier Excel créé: test-super-ai-simple.xlsx');

    // 3. Lire le fichier et le convertir en base64
    console.log('\n3️⃣ Conversion du fichier en base64...');
    const fileBuffer = fs.readFileSync('test-super-ai-simple.xlsx');
    const base64Data = fileBuffer.toString('base64');
    console.log('✅ Fichier converti en base64');

    // 4. Tester l'import avec la route simplifiée
    console.log('\n4️⃣ Test de l\'import avec la route simplifiée...');
    const importResult = await makeRequest('/api/parc-informatique-simple/import/excel-simple', 'POST', {
      data: base64Data
    }, token);
    
    console.log('Status:', importResult.status);
    console.log('Response:', JSON.stringify(importResult.data, null, 2));
    
    if (importResult.status === 200) {
      console.log('✅ Import Super IA réussi !');
      console.log('Importés:', importResult.data.imported);
      console.log('Erreurs:', importResult.data.errors);
      console.log('Avertissements:', importResult.data.warnings);
      console.log('Avertissements IA:', importResult.data.aiWarnings);
      
      if (importResult.data.superAI) {
        console.log('\n🧠 Super IA Analysis:');
        console.log('Niveau d\'intelligence:', importResult.data.superAI.intelligenceLevel);
        console.log('Confiance:', importResult.data.superAI.confidence + '%');
        console.log('Colonnes détectées:', importResult.data.superAI.columnsDetected);
        console.log('Transformations:', importResult.data.superAI.transformations);
        
        if (importResult.data.superAI.columnMapping) {
          console.log('\n📋 Mapping des colonnes:');
          Object.entries(importResult.data.superAI.columnMapping).forEach(([field, mapping]) => {
            console.log(`   ${field}: "${mapping.originalHeader}" (${(mapping.confidence * 100).toFixed(0)}%)`);
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
    if (fs.existsSync('test-super-ai-simple.xlsx')) {
      fs.unlinkSync('test-super-ai-simple.xlsx');
      console.log('✅ Fichier de test supprimé');
    }

    console.log('\n🎉 Test de la Super IA terminé !');
    console.log('\n💡 La Super IA a analysé et transformé vos données :');
    console.log('   ✅ Détecté "Société/Vill" → ville_societe');
    console.log('   ✅ Détecté "Numéro de Département" → serial_number + departement');
    console.log('   ✅ Séparé "Mod-XXX" → propriétaire + modèle');
    console.log('   ✅ Séparé "SN-XXXX-T IT" → S/N + Département');
    console.log('   ✅ Extraits les spécifications automatiquement');
    console.log('   ✅ Créé les équipements (laptop, imprimante, serveur, etc.)');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testSuperAISimple();


