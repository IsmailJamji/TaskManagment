-- Script pour corriger la table parc_informatique

-- Ajouter les colonnes manquantes
ALTER TABLE parc_informatique 
ADD COLUMN IF NOT EXISTS ticket_numero VARCHAR(100);

ALTER TABLE parc_informatique 
ADD COLUMN IF NOT EXISTS ville_societe VARCHAR(100);

ALTER TABLE parc_informatique 
ADD COLUMN IF NOT EXISTS poste VARCHAR(100);

ALTER TABLE parc_informatique 
ADD COLUMN IF NOT EXISTS equipements_supplementaires JSONB DEFAULT '{}';

-- Mettre à jour les contraintes de type pour inclure tous les types
ALTER TABLE parc_informatique 
DROP CONSTRAINT IF EXISTS parc_informatique_type_check;

ALTER TABLE parc_informatique 
ADD CONSTRAINT parc_informatique_type_check 
CHECK (type IN ('laptop', 'desktop', 'unite_centrale', 'clavier', 'imprimante', 'telephone', 'routeur', 'serveur', 'souris', 'ecran', 'casque', 'autre'));

-- Vérifier la structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'parc_informatique' 
ORDER BY ordinal_position;

