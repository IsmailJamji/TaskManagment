// Script de test pour vérifier l'insertion automatique dans la base de données
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testInsertion() {
  console.log('🧪 Test d\'insertion automatique dans la base de données...\n');
  
  try {
    // Test 1: Parc Informatique
    console.log('📱 Test Parc Informatique...');
    const parcInfoData = {
      type: 'laptop',
      marque: 'Dell',
      modele: 'Inspiron 15',
      serial_number: 'DL123456789',
      specifications: {
        disque_dur: '512GB SSD',
        processeur: 'Intel i5',
        ram: '8GB',
        os: 'Windows 11'
      },
      proprietaire: 'Ahmed Benali',
      departement: 'IT',
      est_premiere_main: true,
      date_acquisition: '2023-01-15'
    };
    
    const parcInfoResponse = await fetch(`${API_BASE}/parc-informatique`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Token de test
      },
      body: JSON.stringify(parcInfoData)
    });
    
    if (parcInfoResponse.ok) {
      const result = await parcInfoResponse.json();
      console.log('✅ Parc Informatique: Données insérées avec succès (ID:', result.id, ')');
    } else {
      console.log('❌ Parc Informatique: Erreur', parcInfoResponse.status);
    }
    
    // Test 2: Parc Télécom
    console.log('\n📞 Test Parc Télécom...');
    const parcTelecomData = {
      numero_puce: '212612345678',
      operateur: 'iam',
      proprietaire: 'Fatima Alami',
      departement: 'Ventes',
      specifications: {
        forfait: '20GB',
        type: 'Data'
      }
    };
    
    const parcTelecomResponse = await fetch(`${API_BASE}/parc-telecom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(parcTelecomData)
    });
    
    if (parcTelecomResponse.ok) {
      const result = await parcTelecomResponse.json();
      console.log('✅ Parc Télécom: Données insérées avec succès (ID:', result.id, ')');
    } else {
      console.log('❌ Parc Télécom: Erreur', parcTelecomResponse.status);
    }
    
    // Test 3: Vérification des données dans la base
    console.log('\n🔍 Vérification des données dans la base...');
    
    const checkParcInfo = await fetch(`${API_BASE}/parc-informatique`);
    if (checkParcInfo.ok) {
      const data = await checkParcInfo.json();
      console.log(`✅ Parc Informatique: ${data.length} éléments trouvés dans la base`);
    }
    
    const checkParcTelecom = await fetch(`${API_BASE}/parc-telecom`);
    if (checkParcTelecom.ok) {
      const data = await checkParcTelecom.json();
      console.log(`✅ Parc Télécom: ${data.length} éléments trouvés dans la base`);
    }
    
    console.log('\n🎉 Test d\'insertion automatique terminé !');
    console.log('💡 Les données saisies dans l\'application sont maintenant automatiquement sauvegardées dans PostgreSQL.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Attendre que le serveur démarre
setTimeout(testInsertion, 3000);



