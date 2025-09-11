// Super IA Ultra-Intelligente pour l'import Excel
import * as XLSX from 'xlsx';

class SuperAI {
  constructor() {
    this.intelligenceLevel = 'ULTRA';
    this.learningPatterns = new Map();
    this.dataTransformers = new Map();
    
    // Patterns d'intelligence avancés
    this.smartPatterns = {
      // Détection de colonnes ultra-intelligente
      columnDetection: {
        // Patterns pour détecter les colonnes même tronquées
        truncated: {
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
          'exploitation': 'specifications.os'
        },
        
        // Patterns pour détecter les colonnes par contenu
        contentBased: {
          'mod-': 'modele',
          'sn-': 'serial_number',
          'gb': 'specifications.ram',
          'tb': 'specifications.disque_dur',
          'ssd': 'specifications.disque_dur',
          'hdd': 'specifications.disque_dur',
          'intel': 'specifications.processeur',
          'amd': 'specifications.processeur',
          'windows': 'specifications.os',
          'linux': 'specifications.os',
          'macos': 'specifications.os'
        }
      },
      
      // Transformation intelligente des données
      dataTransformation: {
        // Extraction de données combinées
        extractCombined: {
          'mod-\\d+': (text) => {
            const match = text.match(/mod-(\d+)/i);
            return match ? `Mod-${match[1]}` : null;
          },
          'sn-[a-z0-9-]+': (text) => {
            const match = text.match(/(sn-[a-z0-9-]+)/i);
            return match ? match[1] : null;
          }
        },
        
        // Séparation intelligente des données
        smartSplit: {
          'proprietaire_modele': (text) => {
            const parts = text.split(/\s+/);
            const modPart = parts.find(p => p.match(/mod-\d+/i));
            const namePart = parts.filter(p => !p.match(/mod-\d+/i)).join(' ');
            return {
              proprietaire: namePart.trim() || 'Non spécifié',
              modele: modPart || 'Non spécifié'
            };
          },
          'serial_departement': (text) => {
            const parts = text.split(/\s+/);
            const snPart = parts.find(p => p.match(/sn-[a-z0-9-]+/i));
            const deptPart = parts.find(p => ['IT', 'Marketing', 'Finance', 'RH', 'Direction', 'IT'].includes(p));
            return {
              serial_number: snPart || null,
              departement: deptPart || 'Non spécifié'
            };
          }
        }
      }
    };
  }

  // Analyse ultra-intelligente du fichier Excel
  async analyzeExcel(file, moduleType = 'informatique') {
    try {
      console.log('🧠 Super IA activée - Analyse ultra-intelligente...');
      
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

      // Analyse ultra-intelligente des en-têtes
      const smartMapping = this.ultraIntelligentHeaderAnalysis(headers, moduleType);
      
      // Analyse et transformation ultra-intelligente des données
      const transformedData = this.ultraIntelligentDataAnalysis(dataRows, smartMapping, moduleType);

      console.log('🎯 Mapping intelligent final:', smartMapping);
      console.log('📈 Données transformées:', transformedData.length);

      return {
        success: true,
        columnMapping: smartMapping,
        analyzedData: transformedData,
        totalRows: dataRows.length,
        headers: headers,
        confidence: this.calculateUltraConfidence(smartMapping, transformedData),
        intelligenceLevel: this.intelligenceLevel
      };
    } catch (error) {
      console.error('❌ Erreur Super IA:', error);
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

  // Analyse ultra-intelligente des en-têtes
  ultraIntelligentHeaderAnalysis(headers, moduleType) {
    const mapping = {};
    const patterns = this.smartPatterns.columnDetection;

    console.log('🧠 Analyse ultra-intelligente des en-têtes...');

    headers.forEach((header, index) => {
      if (!header || typeof header !== 'string') return;

      const normalizedHeader = header.toLowerCase().trim();
      let bestMatch = null;
      let bestScore = 0;
      let matchType = '';

      console.log(`🔍 Analyse: "${header}" (normalisé: "${normalizedHeader}")`);

      // 1. Détection des en-têtes tronqués
      for (const [pattern, field] of Object.entries(patterns.truncated)) {
        if (normalizedHeader.includes(pattern) || pattern.includes(normalizedHeader)) {
          const score = this.calculateUltraSimilarity(normalizedHeader, pattern);
          if (score > bestScore) {
            bestMatch = field;
            bestScore = score;
            matchType = 'truncated';
          }
        }
      }

      // 2. Détection basée sur le contenu des données
      if (!bestMatch) {
        const contentScore = this.analyzeContentPatterns(normalizedHeader, moduleType);
        if (contentScore.score > bestScore) {
          bestMatch = contentScore.field;
          bestScore = contentScore.score;
          matchType = 'content';
        }
      }

      // 3. Détection par similarité avancée
      if (!bestMatch) {
        const similarityScore = this.ultraSimilarityAnalysis(normalizedHeader, moduleType);
        if (similarityScore.score > bestScore) {
          bestMatch = similarityScore.field;
          bestScore = similarityScore.score;
          matchType = 'similarity';
        }
      }

      if (bestMatch && bestScore > 0.1) { // Seuil très bas pour plus de flexibilité
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

  // Analyse ultra-intelligente des données
  ultraIntelligentDataAnalysis(dataRows, columnMapping, moduleType) {
    const analyzedData = [];

    console.log('🧠 Analyse ultra-intelligente des données...');

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

      // Transformation ultra-intelligente des données
      this.ultraIntelligentDataTransformation(item, moduleType);
      
      // Normalisation ultra-intelligente
      item.mappedData = this.ultraNormalizeItemData(item.mappedData, moduleType);
      
      // Calcul de la confiance globale
      item.confidence = item.confidence / Math.max(Object.keys(columnMapping).length, 1);

      // Détection ultra-intelligente des problèmes
      this.ultraIntelligentIssueDetection(item, moduleType);

      analyzedData.push(item);
    });

    return analyzedData;
  }

  // Transformation ultra-intelligente des données
  ultraIntelligentDataTransformation(item, moduleType) {
    const data = item.mappedData;
    const transformations = [];

    // 1. Transformation des données combinées
    if (data.proprietaire && data.proprietaire.includes('Mod-')) {
      const result = this.smartPatterns.dataTransformation.smartSplit.proprietaire_modele(data.proprietaire);
      if (result.proprietaire !== data.proprietaire) {
        data.proprietaire = result.proprietaire;
        if (!data.modele || data.modele === 'Non spécifié') {
          data.modele = result.modele;
        }
        transformations.push('Séparation propriétaire/modèle');
      }
    }

    if (data.serial_number && data.serial_number.includes('SN-')) {
      const result = this.smartPatterns.dataTransformation.smartSplit.serial_departement(data.serial_number);
      if (result.serial_number !== data.serial_number) {
        data.serial_number = result.serial_number;
        if (!data.departement || data.departement === 'Non spécifié') {
          data.departement = result.departement;
        }
        transformations.push('Séparation S/N/département');
      }
    }

    // 2. Extraction intelligente des spécifications
    this.extractSmartSpecifications(data, transformations);

    item.transformations = transformations;
  }

  // Extraction intelligente des spécifications
  extractSmartSpecifications(data, transformations) {
    if (!data.specifications) {
      data.specifications = {};
    }

    // Extraction de la RAM depuis n'importe quelle colonne
    const ramPattern = /(\d+)\s*gb/i;
    Object.values(data).forEach(value => {
      if (typeof value === 'string' && ramPattern.test(value)) {
        const match = value.match(ramPattern);
        if (match && !data.specifications.ram) {
          data.specifications.ram = match[0];
          transformations.push('RAM extraite automatiquement');
        }
      }
    });

    // Extraction du disque dur
    const diskPattern = /(\d+)\s*(tb|gb)\s*(ssd|hdd)/i;
    Object.values(data).forEach(value => {
      if (typeof value === 'string' && diskPattern.test(value)) {
        const match = value.match(diskPattern);
        if (match && !data.specifications.disque_dur) {
          data.specifications.disque_dur = match[0];
          transformations.push('Disque dur extrait automatiquement');
        }
      }
    });

    // Extraction du processeur
    const cpuPattern = /(intel|amd)\s+\w+/i;
    Object.values(data).forEach(value => {
      if (typeof value === 'string' && cpuPattern.test(value)) {
        const match = value.match(cpuPattern);
        if (match && !data.specifications.processeur) {
          data.specifications.processeur = match[0];
          transformations.push('Processeur extrait automatiquement');
        }
      }
    });

    // Extraction de l'OS
    const osPattern = /(windows|linux|macos|ubuntu|android|ios)/i;
    Object.values(data).forEach(value => {
      if (typeof value === 'string' && osPattern.test(value)) {
        const match = value.match(osPattern);
        if (match && !data.specifications.os) {
          data.specifications.os = match[0];
          transformations.push('OS extrait automatiquement');
        }
      }
    });
  }

  // Normalisation ultra-intelligente des valeurs
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

  // Normalisation ultra-intelligente des types
  ultraNormalizeType(type) {
    const typeMap = {
      'laptop': 'laptop',
      'portable': 'laptop',
      'ordinateur portable': 'laptop',
      'notebook': 'laptop',
      'desktop': 'desktop',
      'unite centrale': 'unite_centrale',
      'unité centrale': 'unite_centrale',
      'pc fixe': 'desktop',
      'clavier': 'clavier',
      'keyboard': 'clavier',
      'imprimante': 'imprimante',
      'printer': 'imprimante',
      'telephone': 'telephone',
      'téléphone': 'telephone',
      'phone': 'telephone',
      'smartphone': 'telephone',
      'routeur': 'routeur',
      'router': 'routeur',
      'switch': 'routeur',
      'tablette': 'tablette',
      'tablet': 'tablette',
      'serveur': 'serveur',
      'server': 'serveur',
      'autre': 'autre',
      'other': 'autre'
    };

    return typeMap[type.toLowerCase()] || 'autre';
  }

  // Normalisation ultra-intelligente des booléens
  ultraNormalizeBoolean(value) {
    const trueValues = ['oui', 'yes', 'true', '1', 'vrai', 'nouveau', 'new', 'neuf', 'première main', 'premiere main'];
    return trueValues.includes(value.toLowerCase());
  }

  // Normalisation ultra-intelligente des dates
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

  // Normalisation ultra-intelligente des données d'item
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

  // Détection ultra-intelligente des problèmes
  ultraIntelligentIssueDetection(item, moduleType) {
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

  // Analyse des patterns de contenu
  analyzeContentPatterns(header, moduleType) {
    const patterns = this.smartPatterns.columnDetection.contentBased;
    let bestScore = 0;
    let bestField = null;

    for (const [pattern, field] of Object.entries(patterns)) {
      if (header.includes(pattern)) {
        const score = this.calculateUltraSimilarity(header, pattern);
        if (score > bestScore) {
          bestScore = score;
          bestField = field;
        }
      }
    }

    return { field: bestField, score: bestScore };
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

  // Calcul de confiance ultra-intelligent
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

export default new SuperAI();


