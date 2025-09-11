-- Ajouter la colonne equipements_supplementaires à la table parc_informatique
ALTER TABLE parc_informatique 
ADD COLUMN IF NOT EXISTS equipements_supplementaires JSONB DEFAULT '{}';

-- Ajouter la colonne ticket_numero à la table parc_informatique
ALTER TABLE parc_informatique 
ADD COLUMN IF NOT EXISTS ticket_numero VARCHAR(100);

-- Ajouter la colonne age_ans à la table parc_informatique
ALTER TABLE parc_informatique 
ADD COLUMN IF NOT EXISTS age_ans INTEGER;

-- Ajouter la colonne ville_societe à la table parc_informatique
ALTER TABLE parc_informatique 
ADD COLUMN IF NOT EXISTS ville_societe VARCHAR(100);

-- Ajouter la colonne poste à la table parc_informatique
ALTER TABLE parc_informatique 
ADD COLUMN IF NOT EXISTS poste VARCHAR(100);

-- Mettre à jour les contraintes de type pour inclure les nouveaux types
ALTER TABLE parc_informatique 
DROP CONSTRAINT IF EXISTS parc_informatique_type_check;

ALTER TABLE parc_informatique 
ADD CONSTRAINT parc_informatique_type_check 
CHECK (type IN ('laptop', 'desktop', 'unite_centrale', 'clavier', 'imprimante', 'telephone', 'routeur', 'serveur', 'souris', 'ecran', 'casque', 'autre'));
