// Ultra IA - S'adapte à n'importe quelle structure Excel
import * as XLSX from 'xlsx';

class UltraAI {
  constructor() {
    this.intelligenceLevel = 'ULTRA-ADAPTIVE';
    this.learningPatterns = new Map();
    this.adaptiveMappings = new Map();
    
    // Patterns ultra-adaptatifs
    this.ultraPatterns = {
      // Détection ultra-intelligente des colonnes
      columnDetection: {
        // Patterns pour détecter les colonnes même très tronquées
        ultraTruncated: {
          'ociété': 'ville_societe',
          'société': 'ville_societe', 
          'vill': 'ville_societe',
          'ville': 'ville_societe',
          'méro': 'serial_number',
          'numéro': 'serial_number',
          'département': 'departement',
          'départ': 'departement',
          'ème': 'specifications.os',
          'système': 'specifications.os',
          'exploita': 'specifications.os',
          'exploitation': 'specifications.os',
          'proprié': 'proprietaire',
          'proprietaire': 'proprietaire',
          'owner': 'proprietaire',
          'utilisateur': 'proprietaire',
          'user': 'proprietaire',
          'responsable': 'proprietaire',
          'assigné': 'proprietaire',
          'assignee': 'proprietaire',
          'brand': 'marque',
          'fabricant': 'marque',
          'manufacturer': 'marque',
          'constructeur': 'marque',
          'make': 'marque',
          'model': 'modele',
          'modèle': 'modele',
          'reference': 'modele',
          'référence': 'modele',
          'ref': 'modele',
          'serial': 'serial_number',
          'série': 'serial_number',
          'serie': 'serial_number',
          'sn': 'serial_number',
          's/n': 'serial_number',
          'position': 'poste',
          'fonction': 'poste',
          'function': 'poste',
          'role': 'poste',
          'rôle': 'poste',
          'job': 'poste',
          'travail': 'poste',
          'department': 'departement',
          'service': 'departement',
          'division': 'departement',
          'secteur': 'departement',
          'date': 'date_acquisition',
          'acquisition': 'date_acquisition',
          'achat': 'date_acquisition',
          'purchase': 'date_acquisition',
          'première': 'est_premiere_main',
          'premiere': 'est_premiere_main',
          'nouveau': 'est_premiere_main',
          'new': 'est_premiere_main',
          'neuf': 'est_premiere_main',
          'first': 'est_premiere_main',
          'hand': 'est_premiere_main'
        },
        
        // Patterns pour détecter les spécifications
        specifications: {
          'ram': 'specifications.ram',
          'mémoire': 'specifications.ram',
          'memoire': 'specifications.ram',
          'memory': 'specifications.ram',
          'disque': 'specifications.disque_dur',
          'stockage': 'specifications.disque_dur',
          'storage': 'specifications.disque_dur',
          'hdd': 'specifications.disque_dur',
          'ssd': 'specifications.disque_dur',
          'disk': 'specifications.disque_dur',
          'drive': 'specifications.disque_dur',
          'processeur': 'specifications.processeur',
          'cpu': 'specifications.processeur',
          'processor': 'specifications.processeur',
          'chip': 'specifications.processeur',
          'puce': 'specifications.processeur',
          'os': 'specifications.os',
          'système': 'specifications.os',
          'system': 'specifications.os',
          'operating': 'specifications.os',
          'windows': 'specifications.os',
          'linux': 'specifications.os',
          'macos': 'specifications.os',
          'ubuntu': 'specifications.os',
          'android': 'specifications.os',
          'ios': 'specifications.os'
        }
      },
      
      // Types d'équipements ultra-adaptatifs
      equipmentTypes: {
        'laptop': ['laptop', 'portable', 'notebook', 'ordinateur portable', 'pc portable'],
        'desktop': ['desktop', 'unite centrale', 'unité centrale', 'pc fixe', 'ordinateur fixe'],
        'unite_centrale': ['unite centrale', 'unité centrale', 'unite_centrale', 'unité_centrale'],
        'clavier': ['clavier', 'keyboard'],
        'imprimante': ['imprimante', 'printer', 'impression'],
        'telephone': ['telephone', 'téléphone', 'phone', 'smartphone', 'mobile'],
        'routeur': ['routeur', 'router', 'switch', 'modem', 'wifi'],
        'tablette': ['tablette', 'tablet', 'ipad'],
        'serveur': ['serveur', 'server', 'serveur de production', 'production server'],
        'autre': ['autre', 'other', 'divers', 'misc']
      }
    };
  }

  // Analyse ultra-adaptative du fichier Excel
  async analyzeExcel(file, moduleType = 'informatique') {
    try {
      console.log('🧠 Ultra IA activée - Analyse ultra-adaptative...');
      
      const workbook = XLSX.read(file.data, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (rawData.length < 2) {
        throw new Error('Le fichier Excel doit contenir au moins 2 lignes (en-têtes + données)');
      }

      const headers = rawData[0];
      const dataRows = rawData.slice(1);

      console.log('🔍 En-têtes détectés:', headers);
      console.log('📊 Lignes de données:', dataRows.length);

      // Analyse ultra-adaptative des en-têtes
      const ultraMapping = this.ultraAdaptiveHeaderAnalysis(headers, moduleType);
      
      // Analyse et transformation ultra-adaptative des données
      const transformedData = this.ultraAdaptiveDataAnalysis(dataRows, ultraMapping, moduleType);

      console.log('🎯 Mapping ultra-adaptatif final:', ultraMapping);
      console.log('📈 Données transformées:', transformedData.length);

      return {
        success: true,
        columnMapping: ultraMapping,
        analyzedData: transformedData,
        totalRows: dataRows.length,
        headers: headers,
        confidence: this.calculateUltraConfidence(ultraMapping, transformedData),
        intelligenceLevel: this.intelligenceLevel
      };
    } catch (error) {
      console.error('❌ Erreur Ultra IA:', error);
      return {
        success: false,
        error: error.message,
        columnMapping: {},
        analyzedData: [],
        totalRows: 0,
        headers: [],
        confidence: 0,
        intelligenceLevel: this.intelligenceLevel
      };
    }
  }

  // Analyse ultra-adaptative des en-têtes
  ultraAdaptiveHeaderAnalysis(headers, moduleType) {
    const mapping = {};
    const patterns = this.ultraPatterns.columnDetection;

    console.log('🧠 Analyse ultra-adaptative des en-têtes...');

    headers.forEach((header, index) => {
      if (!header || typeof header !== 'string') return;

      const normalizedHeader = header.toLowerCase().trim();
      let bestMatch = null;
      let bestScore = 0;
      let matchType = '';

      console.log(`🔍 Analyse: "${header}" (normalisé: "${normalizedHeader}")`);

      // 1. Détection des en-têtes ultra-tronqués
      for (const [pattern, field] of Object.entries(patterns.ultraTruncated)) {
        if (normalizedHeader.includes(pattern) || pattern.includes(normalizedHeader)) {
          const score = this.calculateUltraSimilarity(normalizedHeader, pattern);
          if (score > bestScore) {
            bestMatch = field;
            bestScore = score;
            matchType = 'ultra-truncated';
          }
        }
      }

      // 2. Détection des spécifications
      if (!bestMatch) {
        for (const [pattern, field] of Object.entries(patterns.specifications)) {
          if (normalizedHeader.includes(pattern) || pattern.includes(normalizedHeader)) {
            const score = this.calculateUltraSimilarity(normalizedHeader, pattern);
            if (score > bestScore) {
              bestMatch = field;
              bestScore = score;
              matchType = 'specifications';
            }
          }
        }
      }

      // 3. Détection par similarité ultra-avancée
      if (!bestMatch) {
        const similarityScore = this.ultraSimilarityAnalysis(normalizedHeader, moduleType);
        if (similarityScore.score > bestScore) {
          bestMatch = similarityScore.field;
          bestScore = similarityScore.score;
          matchType = 'similarity';
        }
      }

      if (bestMatch && bestScore > 0.05) { // Seuil très bas pour plus de flexibilité
        console.log(`✅ Mapping trouvé: "${header}" → ${bestMatch} (${matchType}, confiance: ${bestScore.toFixed(3)})`);
        mapping[bestMatch] = {
          columnIndex: index,
          originalHeader: header,
          confidence: bestScore,
          matchType: matchType
        };
      } else {
        console.log(`❌ Aucun mapping trouvé pour: "${header}"`);
      }
    });

    return mapping;
  }

  // Analyse ultra-adaptative des données
  ultraAdaptiveDataAnalysis(dataRows, columnMapping, moduleType) {
    const analyzedData = [];

    console.log('🧠 Analyse ultra-adaptative des données...');

    dataRows.forEach((row, rowIndex) => {
      if (!row || row.length === 0) return;

      const item = {
        rowIndex: rowIndex + 2,
        originalData: row,
        mappedData: {},
        confidence: 0,
        warnings: [],
        transformations: []
      };

      // Mapping des données selon l'analyse des colonnes
      Object.keys(columnMapping).forEach(field => {
        const mapping = columnMapping[field];
        const value = row[mapping.columnIndex];

        if (value !== undefined && value !== null && value !== '') {
          if (field.startsWith('specifications.')) {
            const specField = field.split('.')[1];
            if (!item.mappedData.specifications) {
              item.mappedData.specifications = {};
            }
            item.mappedData.specifications[specField] = this.ultraNormalizeValue(value, specField);
          } else {
            item.mappedData[field] = this.ultraNormalizeValue(value, field);
          }
          item.confidence += mapping.confidence;
        }
      });

      // Transformation ultra-adaptative des données
      this.ultraAdaptiveDataTransformation(item, moduleType);
      
      // Normalisation ultra-adaptative
      item.mappedData = this.ultraNormalizeItemData(item.mappedData, moduleType);
      
      // Calcul de la confiance globale
      item.confidence = item.confidence / Math.max(Object.keys(columnMapping).length, 1);

      // Détection ultra-adaptative des problèmes
      this.ultraAdaptiveIssueDetection(item, moduleType);

      analyzedData.push(item);
    });

    return analyzedData;
  }

  // Transformation ultra-adaptative des données
  ultraAdaptiveDataTransformation(item, moduleType) {
    const data = item.mappedData;
    const transformations = [];

    // 1. Détection et séparation des données combinées
    this.detectAndSeparateCombinedData(data, transformations);

    // 2. Extraction intelligente des spécifications
    this.extractUltraSpecifications(data, transformations);

    // 3. Détection intelligente du type d'équipement
    this.detectEquipmentType(data, transformations);

    item.transformations = transformations;
  }

  // Détection et séparation des données combinées
  detectAndSeparateCombinedData(data, transformations) {
    // Détection des patterns Mod-XXX
    if (data.proprietaire && data.proprietaire.includes('Mod-')) {
      const result = this.separateModPattern(data.proprietaire);
      if (result.proprietaire !== data.proprietaire) {
        data.proprietaire = result.proprietaire;
        if (!data.modele || data.modele === 'Non spécifié') {
          data.modele = result.modele;
        }
        transformations.push('Séparation Mod-XXX');
      }
    }

    // Détection des patterns SN-XXXX-T
    if (data.serial_number && data.serial_number.includes('SN-')) {
      const result = this.separateSerialPattern(data.serial_number);
      if (result.serial_number !== data.serial_number) {
        data.serial_number = result.serial_number;
        if (!data.departement || data.departement === 'Non spécifié') {
          data.departement = result.departement;
        }
        transformations.push('Séparation SN-XXXX-T');
      }
    }

    // Détection des patterns dans d'autres colonnes
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string' && data[key].includes('Mod-')) {
        const result = this.separateModPattern(data[key]);
        if (result.proprietaire !== data[key]) {
          if (!data.proprietaire || data.proprietaire === 'Non spécifié') {
            data.proprietaire = result.proprietaire;
          }
          if (!data.modele || data.modele === 'Non spécifié') {
            data.modele = result.modele;
          }
          transformations.push(`Séparation Mod-XXX depuis ${key}`);
        }
      }
    });
  }

  // Séparation du pattern Mod-XXX
  separateModPattern(text) {
    const parts = text.split(/\s+/);
    const modPart = parts.find(p => p.match(/mod-\d+/i));
    const namePart = parts.filter(p => !p.match(/mod-\d+/i)).join(' ');
    return {
      proprietaire: namePart.trim() || 'Non spécifié',
      modele: modPart || 'Non spécifié'
    };
  }

  // Séparation du pattern SN-XXXX-T
  separateSerialPattern(text) {
    const parts = text.split(/\s+/);
    const snPart = parts.find(p => p.match(/sn-[a-z0-9-]+/i));
    const deptPart = parts.find(p => ['IT', 'Marketing', 'Finance', 'RH', 'Direction', 'IT'].includes(p));
    return {
      serial_number: snPart || null,
      departement: deptPart || 'Non spécifié'
    };
  }

  // Extraction ultra-intelligente des spécifications
  extractUltraSpecifications(data, transformations) {
    if (!data.specifications) {
      data.specifications = {};
    }

    // Extraction depuis n'importe quelle colonne
    Object.values(data).forEach(value => {
      if (typeof value === 'string') {
        // Extraction de la RAM
        const ramMatch = value.match(/(\d+)\s*gb/i);
        if (ramMatch && !data.specifications.ram) {
          data.specifications.ram = ramMatch[0];
          transformations.push('RAM extraite automatiquement');
        }

        // Extraction du disque dur
        const diskMatch = value.match(/(\d+)\s*(tb|gb)\s*(ssd|hdd)/i);
        if (diskMatch && !data.specifications.disque_dur) {
          data.specifications.disque_dur = diskMatch[0];
          transformations.push('Disque dur extrait automatiquement');
        }

        // Extraction du processeur
        const cpuMatch = value.match(/(intel|amd|apple|arm)\s+\w+/i);
        if (cpuMatch && !data.specifications.processeur) {
          data.specifications.processeur = cpuMatch[0];
          transformations.push('Processeur extrait automatiquement');
        }

        // Extraction de l'OS
        const osMatch = value.match(/(windows|linux|macos|ubuntu|android|ios)/i);
        if (osMatch && !data.specifications.os) {
          data.specifications.os = osMatch[0];
          transformations.push('OS extrait automatiquement');
        }
      }
    });
  }

  // Détection intelligente du type d'équipement
  detectEquipmentType(data, transformations) {
    if (!data.type || data.type === 'Non spécifié') {
      // Détection basée sur les mots-clés
      const allText = Object.values(data).join(' ').toLowerCase();
      
      for (const [type, keywords] of Object.entries(this.ultraPatterns.equipmentTypes)) {
        for (const keyword of keywords) {
          if (allText.includes(keyword.toLowerCase())) {
            data.type = type;
            transformations.push(`Type détecté: ${type}`);
            break;
          }
        }
        if (data.type !== 'Non spécifié') break;
      }
      
      if (data.type === 'Non spécifié') {
        data.type = 'autre';
        transformations.push('Type par défaut: autre');
      }
    }
  }

  // Normalisation ultra-adaptative des valeurs
  ultraNormalizeValue(value, field) {
    if (typeof value !== 'string') return value;

    const normalized = value.toString().trim();

    // Normalisation des types d'équipement
    if (field === 'type') {
      return this.ultraNormalizeType(normalized);
    }

    // Normalisation des booléens
    if (field === 'est_premiere_main') {
      return this.ultraNormalizeBoolean(normalized);
    }

    // Normalisation des dates
    if (field === 'date_acquisition') {
      return this.ultraNormalizeDate(normalized);
    }

    return normalized;
  }

  // Normalisation ultra-adaptative des types
  ultraNormalizeType(type) {
    const typeMap = this.ultraPatterns.equipmentTypes;
    
    for (const [standardType, keywords] of Object.entries(typeMap)) {
      for (const keyword of keywords) {
        if (type.toLowerCase().includes(keyword.toLowerCase())) {
          return standardType;
        }
      }
    }

    return 'autre';
  }

  // Normalisation ultra-adaptative des booléens
  ultraNormalizeBoolean(value) {
    const trueValues = ['oui', 'yes', 'true', '1', 'vrai', 'nouveau', 'new', 'neuf', 'première main', 'premiere main', 'first hand'];
    return trueValues.includes(value.toLowerCase());
  }

  // Normalisation ultra-adaptative des dates
  ultraNormalizeDate(value) {
    if (!value) return new Date().toISOString().split('T')[0];

    // Gestion des dates Excel (nombres)
    if (typeof value === 'number') {
      const date = new Date((value - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }

    // Gestion des chaînes de date
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    return new Date().toISOString().split('T')[0];
  }

  // Normalisation ultra-adaptative des données d'item
  ultraNormalizeItemData(data, moduleType) {
    const normalized = { ...data };

    // Champs requis par défaut
    if (!normalized.type) normalized.type = 'autre';
    if (!normalized.marque) normalized.marque = 'Non spécifié';
    if (!normalized.proprietaire) normalized.proprietaire = 'Non spécifié';
    if (!normalized.departement) normalized.departement = 'Non spécifié';
    if (!normalized.date_acquisition) normalized.date_acquisition = new Date().toISOString().split('T')[0];
    if (normalized.est_premiere_main === undefined) normalized.est_premiere_main = true;

    // Normalisation des spécifications
    if (!normalized.specifications) {
      normalized.specifications = {};
    }

    return normalized;
  }

  // Détection ultra-adaptative des problèmes
  ultraAdaptiveIssueDetection(item, moduleType) {
    const warnings = [];

    // Vérification des champs requis
    if (!item.mappedData.marque || item.mappedData.marque === 'Non spécifié') {
      warnings.push('Marque manquante ou non spécifiée');
    }

    if (!item.mappedData.proprietaire || item.mappedData.proprietaire === 'Non spécifié') {
      warnings.push('Propriétaire manquant ou non spécifié');
    }

    // Vérification des types
    if (item.mappedData.type === 'autre') {
      warnings.push('Type d\'équipement non reconnu, converti en "autre"');
    }

    // Vérification des dates
    const acquisitionDate = new Date(item.mappedData.date_acquisition);
    const now = new Date();
    if (acquisitionDate > now) {
      warnings.push('Date d\'acquisition dans le futur');
    }

    item.warnings = warnings;
  }

  // Analyse de similarité ultra-avancée
  ultraSimilarityAnalysis(header, moduleType) {
    const fieldMappings = {
      informatique: {
        type: ['type', 'categorie', 'category', 'equipement', 'équipement', 'nature', 'equipment'],
        marque: ['marque', 'brand', 'fabricant', 'manufacturer', 'constructeur', 'make'],
        modele: ['modele', 'modèle', 'model', 'reference', 'référence', 'ref'],
        serial_number: ['serial', 'série', 'serie', 'sn', 's/n', 'numéro de série', 'numero de serie', 'serial number'],
        proprietaire: ['proprietaire', 'propriétaire', 'owner', 'assigné', 'assignee', 'utilisateur', 'user', 'responsable'],
        ville_societe: ['ville', 'city', 'société', 'societe', 'company', 'entreprise', 'location', 'lieu'],
        poste: ['poste', 'position', 'fonction', 'function', 'role', 'rôle', 'job', 'travail'],
        departement: ['département', 'departement', 'department', 'service', 'division', 'secteur'],
        date_acquisition: ['date', 'acquisition', 'achat', 'purchase', 'date achat', 'date d\'achat'],
        est_premiere_main: ['première main', 'premiere main', 'nouveau', 'new', 'neuf'],
        specifications: {
          disque_dur: ['disque', 'stockage', 'storage', 'hdd', 'ssd', 'disque dur'],
          processeur: ['processeur', 'cpu', 'processor', 'chip', 'puce'],
          ram: ['ram', 'mémoire', 'memoire', 'memory', 'mémoire ram'],
          os: ['os', 'système', 'system', 'operating system', 'windows', 'linux', 'macos']
        }
      }
    };

    const mappings = fieldMappings[moduleType] || fieldMappings.informatique;
    let bestScore = 0;
    let bestField = null;

    Object.keys(mappings).forEach(field => {
      if (field === 'specifications') {
        Object.keys(mappings[field]).forEach(spec => {
          const keywords = mappings[field][spec];
          const score = this.calculateUltraSimilarity(header, keywords);
          if (score > bestScore) {
            bestScore = score;
            bestField = `specifications.${spec}`;
          }
        });
      } else {
        const keywords = Array.isArray(mappings[field]) ? mappings[field] : [mappings[field]];
        const score = this.calculateUltraSimilarity(header, keywords);
        if (score > bestScore) {
          bestScore = score;
          bestField = field;
        }
      }
    });

    return { field: bestField, score: bestScore };
  }

  // Calcul de similarité ultra-avancé
  calculateUltraSimilarity(str, keywords) {
    let maxScore = 0;
    
    const keywordArray = Array.isArray(keywords) ? keywords : [keywords];
    
    keywordArray.forEach(keyword => {
      const score = this.levenshteinSimilarity(str, keyword);
      if (score > maxScore) {
        maxScore = score;
      }
      
      // Correspondance exacte
      if (str === keyword) {
        maxScore = 1.0;
      }
      
      // Correspondance partielle
      if (str.includes(keyword) || keyword.includes(str)) {
        const partialScore = Math.min(str.length, keyword.length) / Math.max(str.length, keyword.length);
        if (partialScore > maxScore) {
          maxScore = partialScore;
        }
      }
    });

    return maxScore;
  }

  // Algorithme de Levenshtein ultra-optimisé
  levenshteinSimilarity(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[len2][len1];
    const maxLength = Math.max(len1, len2);
    return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
  }

  // Calcul de confiance ultra-adaptatif
  calculateUltraConfidence(columnMapping, analyzedData) {
    if (Object.keys(columnMapping).length === 0) return 0;
    
    const totalConfidence = Object.values(columnMapping).reduce((sum, mapping) => sum + mapping.confidence, 0);
    const avgConfidence = totalConfidence / Object.keys(columnMapping).length;
    
    // Bonus pour les transformations réussies
    const transformationBonus = analyzedData.reduce((sum, item) => {
      return sum + (item.transformations ? item.transformations.length : 0);
    }, 0) / Math.max(analyzedData.length, 1) * 0.1;
    
    return Math.min(avgConfidence + transformationBonus, 1.0);
  }
}

export default new UltraAI();


