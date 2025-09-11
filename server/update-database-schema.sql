-- Mise à jour du schéma de base de données pour les nouveaux champs

-- Ajouter les nouveaux champs à parc_informatique
ALTER TABLE parc_informatique 
ADD COLUMN IF NOT EXISTS ville_societe VARCHAR(255),
ADD COLUMN IF NOT EXISTS poste VARCHAR(255);

-- Ajouter les nouveaux champs à parc_telecom
ALTER TABLE parc_telecom 
ADD COLUMN IF NOT EXISTS ville_societe VARCHAR(255),
ADD COLUMN IF NOT EXISTS poste VARCHAR(255);

-- Mettre à jour les colonnes existantes si nécessaire
UPDATE parc_informatique SET ville_societe = proprietaire WHERE ville_societe IS NULL;
UPDATE parc_telecom SET ville_societe = proprietaire WHERE ville_societe IS NULL;



