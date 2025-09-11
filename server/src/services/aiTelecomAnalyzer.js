// Service IA spécialisé pour analyser les fichiers Excel du Parc Télécom
import * as XLSX from 'xlsx';

class AITelecomAnalyzer {
  constructor() {
    this.fieldMappings = {
      type: ['type', 'categorie', 'category', 'equipement', 'équipement', 'nature', 'appareil'],
      marque: ['marque', 'brand', 'fabricant', 'manufacturer', 'constructeur', 'modèle', 'model'],
      modele: ['modele', 'modèle', 'model', 'reference', 'référence', 'ref', 'version'],
      serial_number: ['serial', 'série', 'serie', 'sn', 's/n', 'numéro de série', 'numero de serie', 'serial number', 'imei'],
      numero_puce: ['puce', 'sim', 'imei', 'numero puce', 'numéro puce', 'sim card', 'carte sim', 'numero sim', 'numéro sim'],
      proprietaire: ['proprietaire', 'propriétaire', 'owner', 'assigné', 'assignee', 'utilisateur', 'user', 'responsable', 'titulaire'],
      ville_societe: ['ville', 'city', 'société', 'societe', 'company', 'entreprise', 'location', 'lieu', 'adresse'],
      poste: ['poste', 'position', 'fonction', 'function', 'role', 'rôle', 'job', 'travail', 'emploi'],
      departement: ['département', 'departement', 'department', 'service', 'division', 'secteur', 'direction'],
      date_acquisition: ['date', 'acquisition', 'achat', 'purchase', 'date achat', 'date d\'achat', 'date acquisition', 'date d\'acquisition'],
      est_premiere_main: ['première main', 'premiere main', 'nouveau', 'new', 'neuf', 'occasion', 'used', 'usagé'],
      specifications: {
        type: ['type', 'categorie', 'category', 'nature', 'genre'],
        capacite: ['capacité', 'capacite', 'capacity', 'stockage', 'storage', 'mémoire', 'memoire', 'memory'],
        reseau: ['réseau', 'reseau', 'network', '4g', '5g', 'wifi', 'bluetooth', 'connectivité', 'connectivite'],
        autres: ['autres', 'other', 'notes', 'commentaires', 'description', 'specs', 'spécifications', 'caractéristiques']
      }
    };

    this.telecomTypes = {
      'telephone': 'telephone',
      'téléphone': 'telephone',
      'phone': 'telephone',
      'smartphone': 'telephone',
      'mobile': 'telephone',
      'portable': 'telephone',
      'tablette': 'tablette',
      'tablet': 'tablette',
      'ipad': 'tablette',
      'routeur': 'routeur',
      'router': 'routeur',
      'modem': 'routeur',
      'switch': 'routeur',
      'commutateur': 'routeur',
      'autre': 'autre',
      'other': 'autre'
    };
  }

  // Fonction principale d'analyse IA pour le télécom
  async analyzeExcel(file) {
    try {
      const workbook = XLSX.read(file.data, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (rawData.length < 2) {
        throw new Error('Le fichier Excel doit contenir au moins 2 lignes (en-têtes + données)');
      }

      const headers = rawData[0];
      const dataRows = rawData.slice(1);

      // Analyse IA des en-têtes
      const columnMapping = this.analyzeHeaders(headers);
      
      // Analyse IA des données
      const analyzedData = this.analyzeData(dataRows, columnMapping);

      return {
        success: true,
        columnMapping,
        analyzedData,
        totalRows: dataRows.length,
        headers: headers,
        confidence: this.calculateConfidence(columnMapping)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        columnMapping: {},
        analyzedData: [],
        totalRows: 0,
        headers: [],
        confidence: 0
      };
    }
  }

  // Analyse IA des en-têtes de colonnes pour télécom
  analyzeHeaders(headers) {
    const mapping = {};

    headers.forEach((header, index) => {
      if (!header || typeof header !== 'string') return;

      const normalizedHeader = header.toLowerCase().trim();
      let bestMatch = null;
      let bestScore = 0;

      // Recherche dans tous les champs
      Object.keys(this.fieldMappings).forEach(field => {
        if (field === 'specifications') {
          // Gestion spéciale pour les spécifications
          Object.keys(this.fieldMappings[field]).forEach(spec => {
            const specKeywords = this.fieldMappings[field][spec];
            const score = this.calculateSimilarity(normalizedHeader, specKeywords);
            if (score > bestScore && score > 0.3) {
              bestMatch = `specifications.${spec}`;
              bestScore = score;
            }
          });
        } else {
          const keywords = Array.isArray(this.fieldMappings[field]) ? this.fieldMappings[field] : [this.fieldMappings[field]];
          const score = this.calculateSimilarity(normalizedHeader, keywords);
          if (score > bestScore && score > 0.3) {
            bestMatch = field;
            bestScore = score;
          }
        }
      });

      if (bestMatch) {
        mapping[bestMatch] = {
          columnIndex: index,
          originalHeader: header,
          confidence: bestScore
        };
      }
    });

    return mapping;
  }

  // Analyse IA des données télécom
  analyzeData(dataRows, columnMapping) {
    const analyzedData = [];

    dataRows.forEach((row, rowIndex) => {
      if (!row || row.length === 0) return;

      const item = {
        rowIndex: rowIndex + 2,
        originalData: row,
        mappedData: {},
        confidence: 0,
        warnings: []
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
            item.mappedData.specifications[specField] = this.normalizeValue(value, specField);
          } else {
            item.mappedData[field] = this.normalizeValue(value, field);
          }
          item.confidence += mapping.confidence;
        }
      });

      // Normalisation des données télécom
      item.mappedData = this.normalizeTelecomData(item.mappedData);
      
      // Calcul de la confiance globale
      item.confidence = item.confidence / Object.keys(columnMapping).length;

      // Détection des problèmes spécifiques au télécom
      this.detectTelecomIssues(item);

      analyzedData.push(item);
    });

    return analyzedData;
  }

  // Normalisation des valeurs télécom
  normalizeValue(value, field) {
    if (typeof value !== 'string') return value;

    const normalized = value.toString().trim();

    // Normalisation des types d'équipement télécom
    if (field === 'type') {
      return this.normalizeTelecomType(normalized);
    }

    // Normalisation des booléens
    if (field === 'est_premiere_main') {
      return this.normalizeBoolean(normalized);
    }

    // Normalisation des dates
    if (field === 'date_acquisition') {
      return this.normalizeDate(normalized);
    }

    // Normalisation des numéros de puce
    if (field === 'numero_puce') {
      return this.normalizePuceNumber(normalized);
    }

    return normalized;
  }

  // Normalisation des types d'équipement télécom
  normalizeTelecomType(type) {
    return this.telecomTypes[type.toLowerCase()] || 'autre';
  }

  // Normalisation des numéros de puce
  normalizePuceNumber(value) {
    // Nettoyer le numéro de puce (enlever espaces, tirets, etc.)
    return value.toString().replace(/[\s\-\.]/g, '');
  }

  // Normalisation des booléens
  normalizeBoolean(value) {
    const trueValues = ['oui', 'yes', 'true', '1', 'vrai', 'nouveau', 'new', 'neuf'];
    return trueValues.includes(value.toLowerCase());
  }

  // Normalisation des dates
  normalizeDate(value) {
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

  // Normalisation des données télécom
  normalizeTelecomData(data) {
    const normalized = { ...data };

    // Champs requis par défaut
    if (!normalized.type) normalized.type = 'autre';
    if (!normalized.marque) normalized.marque = 'Non spécifié';
    if (!normalized.proprietaire) normalized.proprietaire = 'Non spécifié';
    if (!normalized.departement) normalized.departement = 'Non spécifié';
    if (!normalized.date_acquisition) normalized.date_acquisition = new Date().toISOString().split('T')[0];
    if (normalized.est_premiere_main === undefined) normalized.est_premiere_main = true;

    // Normalisation des spécifications télécom
    if (!normalized.specifications) {
      normalized.specifications = {};
    }

    return normalized;
  }

  // Détection des problèmes spécifiques au télécom
  detectTelecomIssues(item) {
    const warnings = [];

    // Vérification des champs requis
    if (!item.mappedData.marque || item.mappedData.marque === 'Non spécifié') {
      warnings.push('Marque manquante ou non spécifiée');
    }

    if (!item.mappedData.proprietaire || item.mappedData.proprietaire === 'Non spécifié') {
      warnings.push('Propriétaire manquant ou non spécifié');
    }

    // Vérification des types télécom
    if (item.mappedData.type === 'autre') {
      warnings.push('Type d\'équipement télécom non reconnu, converti en "autre"');
    }

    // Vérification des numéros de puce
    if (item.mappedData.numero_puce) {
      const puceNumber = item.mappedData.numero_puce.toString();
      if (puceNumber.length < 10) {
        warnings.push('Numéro de puce semble trop court');
      }
    }

    // Vérification des dates
    const acquisitionDate = new Date(item.mappedData.date_acquisition);
    const now = new Date();
    if (acquisitionDate > now) {
      warnings.push('Date d\'acquisition dans le futur');
    }

    item.warnings = warnings;
  }

  // Calcul de similarité entre chaînes
  calculateSimilarity(str, keywords) {
    let maxScore = 0;
    
    keywords.forEach(keyword => {
      const score = this.levenshteinSimilarity(str, keyword);
      if (score > maxScore) {
        maxScore = score;
      }
    });

    return maxScore;
  }

  // Algorithme de Levenshtein pour calculer la similarité
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

  // Calcul de la confiance globale
  calculateConfidence(columnMapping) {
    if (Object.keys(columnMapping).length === 0) return 0;
    
    const totalConfidence = Object.values(columnMapping).reduce((sum, mapping) => sum + mapping.confidence, 0);
    return totalConfidence / Object.keys(columnMapping).length;
  }
}

export default new AITelecomAnalyzer();


