# Configuration PostgreSQL pour TaskForge

## Problème actuel
L'application ne peut pas se connecter à PostgreSQL car la base de données n'est pas configurée.

## Solutions possibles

### Option 1: Installer PostgreSQL (Recommandé)

1. **Télécharger PostgreSQL** :
   - Aller sur https://www.postgresql.org/download/windows/
   - Télécharger la version 14 ou plus récente
   - Installer avec les paramètres par défaut

2. **Pendant l'installation** :
   - Mot de passe pour l'utilisateur `postgres` : `postgres123` (ou votre choix)
   - Port : `5432` (par défaut)

3. **Créer la base de données et l'utilisateur** :
   ```sql
   -- Se connecter en tant que postgres
   CREATE DATABASE "TaskManager";
   CREATE USER "TaskManager_user" WITH PASSWORD 'taskmanager_pass';
   GRANT ALL PRIVILEGES ON DATABASE "TaskManager" TO "TaskManager_user";
   ```

### Option 2: Utiliser Docker (Plus simple)

1. **Installer Docker Desktop** :
   - Télécharger depuis https://www.docker.com/products/docker-desktop

2. **Lancer PostgreSQL avec Docker** :
   ```bash
   docker run --name taskforge-postgres -e POSTGRES_DB=TaskManager -e POSTGRES_USER=TaskManager_user -e POSTGRES_PASSWORD=taskmanager_pass -p 5432:5432 -d postgres:14
   ```

### Option 3: Utiliser SQLite (Temporaire)

Si vous voulez continuer avec SQLite en attendant, modifiez le fichier `server/src/config/database-unified.js` :

```javascript
// Remplacer la ligne 22-36 par :
try {
  console.log('🔄 Tentative de connexion à PostgreSQL...');
  await pgPool.query('SELECT 1');
  currentPool = pgPool;
  dbType = 'postgresql';
  console.log('✅ Connexion PostgreSQL réussie !');
  await initPostgreSQLTables();
  return currentPool;
} catch (pgError) {
  console.log('⚠️  PostgreSQL non disponible, utilisation de SQLite...');
  console.log('Erreur PostgreSQL:', pgError.message);
  
  // Utiliser SQLite comme fallback
  await initSQLiteDatabase();
  currentPool = sqlitePool;
  dbType = 'sqlite';
  console.log('✅ SQLite initialisé avec succès !');
  return currentPool;
}
```

## Vérification

Une fois PostgreSQL configuré, testez avec :
```bash
node test-postgresql.js
```

## Paramètres de connexion actuels

- **Host** : localhost
- **Port** : 5432
- **Database** : TaskManager
- **User** : TaskManager_user
- **Password** : taskmanager_pass

## Support

Si vous avez des problèmes, dites-moi quelle option vous préférez et je vous aiderai à la configurer.
