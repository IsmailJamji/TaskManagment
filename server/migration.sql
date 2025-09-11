-- Migration script to update parc_informatique and parc_telecom tables
-- Run this script to update existing database

-- Update parc_informatique table
ALTER TABLE parc_informatique 
DROP COLUMN IF EXISTS user_id,
ADD COLUMN IF NOT EXISTS proprietaire VARCHAR(100);

-- Make modele and serial_number nullable
ALTER TABLE parc_informatique 
ALTER COLUMN modele DROP NOT NULL,
ALTER COLUMN serial_number DROP NOT NULL;

-- Make departement nullable
ALTER TABLE parc_informatique 
ALTER COLUMN departement DROP NOT NULL;

-- Update parc_telecom table
ALTER TABLE parc_telecom 
DROP COLUMN IF EXISTS user_id;

-- Make numero_puce nullable
ALTER TABLE parc_telecom 
ALTER COLUMN numero_puce DROP NOT NULL;

-- Make departement nullable
ALTER TABLE parc_telecom 
ALTER COLUMN departement DROP NOT NULL;

-- Update existing records with default values
UPDATE parc_informatique 
SET proprietaire = 'Non spécifié' 
WHERE proprietaire IS NULL;

UPDATE parc_telecom 
SET proprietaire = 'Non spécifié' 
WHERE proprietaire IS NULL;

-- Make proprietaire NOT NULL after setting default values
ALTER TABLE parc_informatique 
ALTER COLUMN proprietaire SET NOT NULL;

ALTER TABLE parc_telecom 
ALTER COLUMN proprietaire SET NOT NULL;


