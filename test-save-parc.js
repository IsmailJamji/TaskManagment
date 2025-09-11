// Test simple pour vérifier la sauvegarde du parc informatique
const testData = {
  type: 'laptop',
  marque: 'Dell',
  modele: 'Inspiron',
  serial_number: 'TEST123',
  ticket_numero: 'TICKET456',
  specifications: {
    disque_dur: '512GB',
    processeur: 'i7',
    ram: '16GB',
    os: 'Windows 11',
    autres: 'Test'
  },
  equipements_supplementaires: {
    clavier: true,
    souris: true,
    ecran: false,
    casque: false
  },
  proprietaire: 'Test User',
  ville_societe: 'Casablanca',
  poste: 'Développeur',
  departement: 'IT',
  est_premiere_main: true,
  date_acquisition: '2024-01-01'
};

async function testSave() {
  try {
    console.log('🧪 Test de sauvegarde du parc informatique...');
    console.log('📋 Données à envoyer:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/parc-informatique', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.text();
    console.log('📤 Réponse du serveur:', result);
    
    if (response.ok) {
      console.log('✅ Sauvegarde réussie');
    } else {
      console.log('❌ Erreur de sauvegarde:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testSave();

