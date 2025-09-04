CREATE DATABASE TaskManager;
CREATE USER TaskManager_user WITH PASSWORD 'taskmanager_pass';
GRANT ALL PRIVILEGES ON DATABASE TaskManager TO TaskManager_user;
-- The following lines require psql:
\\connect TaskManager
GRANT ALL ON SCHEMA public TO TaskManager_user;
ALTER DATABASE TaskManager OWNER TO TaskManager_user;
