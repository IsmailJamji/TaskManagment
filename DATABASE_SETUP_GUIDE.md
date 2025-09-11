# Guide de Configuration de la Base de Données

## Problème
Les erreurs de sauvegarde du parc télécom indiquent un problème de connexion à la base de données PostgreSQL.

## Solutions

### Option 1: Vérifier PostgreSQL
1. **Vérifier que PostgreSQL est installé et en cours d'exécution**
   ```bash
   # Windows
   services.msc
   # Chercher "PostgreSQL" et s'assurer qu'il est en cours d'exécution
   
   # Ou via ligne de commande
   pg_ctl status
   ```

2. **Démarrer PostgreSQL si nécessaire**
   ```bash
   # Windows
   net start postgresql-x64-13
   # (remplacer 13 par votre version)
   ```

### Option 2: Configuration manuelle
1. **Se connecter à PostgreSQL en tant qu'administrateur**
   ```bash
   psql -U postgres
   ```

2. **Créer la base de données et l'utilisateur**
   ```sql
   CREATE DATABASE "TaskManager";
   CREATE USER "TaskManager_user" WITH PASSWORD 'taskmanager_pass';
   GRANT ALL PRIVILEGES ON DATABASE "TaskManager" TO "TaskManager_user";
   \q
   ```

3. **Se connecter à la nouvelle base de données**
   ```bash
   psql -U TaskManager_user -d TaskManager
   ```

4. **Exécuter le script de création des tables**
   ```bash
   psql -U TaskManager_user -d TaskManager -f create_db.sql
   ```

### Option 3: Utiliser un autre port
Si PostgreSQL utilise un port différent, modifiez la configuration dans `server/src/config/database.ts`:

```typescript
const pool = new Pool({
  user: 'TaskManager_user',
  host: 'localhost',
  database: 'TaskManager',
  password: 'taskmanager_pass',
  port: 5433, // Changer le port si nécessaire
});
```

### Option 4: Vérifier les paramètres de connexion
Les paramètres par défaut sont:
- **Host**: localhost
- **Port**: 5432
- **Database**: TaskManager
- **User**: TaskManager_user
- **Password**: taskmanager_pass

## Test de connexion
Une fois PostgreSQL configuré, testez avec:
```bash
cd server
node test-connection.js
```

## Démarrer le serveur
```bash
cd server
npm run dev
```

## Vérification
1. Le serveur démarre sans erreur
2. Les routes API répondent correctement
3. Les formulaires de parc télécom fonctionnent
4. Les données sont sauvegardées en base
