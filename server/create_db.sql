CREATE DATABASE TaskManager;
CREATE USER TaskManager_user WITH PASSWORD 'taskmanager_pass';
GRANT ALL PRIVILEGES ON DATABASE TaskManager TO TaskManager_user;
-- The following lines require psql:
\connect TaskManager
GRANT ALL ON SCHEMA public TO TaskManager_user;
ALTER DATABASE TaskManager OWNER TO TaskManager_user;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignee_id INTEGER REFERENCES users(id),
    assigner_id INTEGER REFERENCES users(id),
    due_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parc Informatique table
CREATE TABLE parc_informatique (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('laptop', 'unite_centrale', 'clavier', 'imprimante', 'telephone', 'routeur', 'autre')),
    marque VARCHAR(100) NOT NULL,
    modele VARCHAR(100),
    serial_number VARCHAR(100),
    specifications JSONB,
    proprietaire VARCHAR(100) NOT NULL,
    departement VARCHAR(100),
    est_premiere_main BOOLEAN DEFAULT true,
    date_acquisition DATE NOT NULL,
    age_ans INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_acquisition))) STORED,
    est_ancien BOOLEAN GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_acquisition)) > 5) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parc Télécom table
CREATE TABLE parc_telecom (
    id SERIAL PRIMARY KEY,
    numero_puce VARCHAR(20),
    operateur VARCHAR(10) NOT NULL CHECK (operateur IN ('iam', 'inwi')),
    proprietaire VARCHAR(255) NOT NULL,
    departement VARCHAR(100),
    specifications JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projets table
CREATE TABLE projets (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    chef_projet_id INTEGER REFERENCES users(id),
    date_debut DATE NOT NULL,
    date_fin_prevue DATE NOT NULL,
    statut VARCHAR(20) DEFAULT 'planifie' CHECK (statut IN ('planifie', 'en_cours', 'suspendu', 'termine', 'annule')),
    priorite VARCHAR(20) DEFAULT 'medium' CHECK (priorite IN ('low', 'medium', 'high')),
    budget DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Équipes de projet (many-to-many)
CREATE TABLE projet_equipes (
    projet_id INTEGER REFERENCES projets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (projet_id, user_id)
);

-- Sous-tâches table
CREATE TABLE sous_taches (
    id SERIAL PRIMARY KEY,
    projet_id INTEGER REFERENCES projets(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    assigne_id INTEGER REFERENCES users(id),
    date_debut DATE NOT NULL,
    date_fin_prevue DATE NOT NULL,
    statut VARCHAR(20) DEFAULT 'not_started' CHECK (statut IN ('not_started', 'in_progress', 'completed', 'blocked')),
    priorite VARCHAR(20) DEFAULT 'medium' CHECK (priorite IN ('low', 'medium', 'high')),
    progression INTEGER DEFAULT 0 CHECK (progression >= 0 AND progression <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_assigner ON tasks(assigner_id);
CREATE INDEX idx_parc_informatique_user ON parc_informatique(user_id);
CREATE INDEX idx_parc_telecom_user ON parc_telecom(user_id);
CREATE INDEX idx_projets_chef ON projets(chef_projet_id);
CREATE INDEX idx_sous_taches_projet ON sous_taches(projet_id);
CREATE INDEX idx_sous_taches_assignee ON sous_taches(assigne_id);

-- Insert admin user
INSERT INTO users (name, email, password_hash, role, department) 
VALUES ('Admin', 'admin@taskmanager.com', '$2b$10$rQZ8K9vL8mN3pQrS5tUvCOYzA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q', 'admin', 'IT');