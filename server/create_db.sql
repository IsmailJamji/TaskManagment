CREATE DATABASE taskforge;
CREATE USER taskforge_user WITH PASSWORD 'taskforge_pass';
GRANT ALL PRIVILEGES ON DATABASE taskforge TO taskforge_user;
-- The following lines require psql:
\\connect taskforge
GRANT ALL ON SCHEMA public TO taskforge_user;
ALTER DATABASE taskforge OWNER TO taskforge_user;
