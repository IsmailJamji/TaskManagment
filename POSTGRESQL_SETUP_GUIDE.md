# 🔧 Guide de Configuration PostgreSQL

## Problème Actuel
- Erreur d'authentification pour l'utilisateur `postgres`
- L'utilisateur `TaskManager_user` n'existe pas
- Le serveur ne peut pas se connecter à la base de données

## Solutions

### Option 1: Vérifier PostgreSQL
1. **Vérifier que PostgreSQL est installé et en cours d'exécution**
   ```bash
   # Ouvrir le Gestionnaire des services Windows
   services.msc
   # Chercher "PostgreSQL" et s'assurer qu'il est en cours d'exécution
   ```

2. **Vérifier la version et le port**
   ```bash
   # Dans le Gestionnaire des services, noter le nom exact du service
   # Exemple: postgresql-x64-13, postgresql-x64-14, etc.
   ```

### Option 2: Configuration manuelle via pgAdmin
1. **Ouvrir pgAdmin** (interface graphique de PostgreSQL)
2. **Se connecter au serveur PostgreSQL**
3. **Créer la base de données** :
   - Clic droit sur "Databases" → "Create" → "Database"
   - Nom: `TaskManager`
4. **Créer l'utilisateur** :
   - Clic droit sur "Login/Group Roles" → "Create" → "Login/Group Role"
   - Nom: `TaskManager_user`
   - Mot de passe: `taskmanager_pass`
   - Onglet "Privileges" : Cocher "Can login" et "Superuser"

### Option 3: Utiliser SQLite (Alternative simple)
Si PostgreSQL pose problème, nous pouvons configurer SQLite temporairement.

### Option 4: Configuration via ligne de commande
1. **Ouvrir l'invite de commande en tant qu'administrateur**
2. **Se connecter à PostgreSQL** :
   ```bash
   psql -U postgres
   # Ou avec votre nom d'utilisateur Windows
   psql -U votre_nom_utilisateur
   ```
3. **Créer la base et l'utilisateur** :
   ```sql
   CREATE DATABASE "TaskManager";
   CREATE USER "TaskManager_user" WITH PASSWORD 'taskmanager_pass';
   GRANT ALL PRIVILEGES ON DATABASE "TaskManager" TO "TaskManager_user";
   \q
   ```

### Option 5: Réinitialiser le mot de passe PostgreSQL
1. **Arrêter le service PostgreSQL**
2. **Modifier le fichier pg_hba.conf** :
   - Localiser le fichier (généralement dans `C:\Program Files\PostgreSQL\[version]\data\`)
   - Changer `md5` en `trust` pour la ligne local
3. **Redémarrer PostgreSQL**
4. **Se connecter sans mot de passe** :
   ```bash
   psql -U postgres
   ```
5. **Changer le mot de passe** :
   ```sql
   ALTER USER postgres PASSWORD 'postgres';
   ```
6. **Remettre `md5` dans pg_hba.conf**
7. **Redémarrer PostgreSQL**

## Test de Connexion
Une fois configuré, testez avec :
```bash
psql -U TaskManager_user -d TaskManager -h localhost
```

## Démarrer l'Application
```bash
cd server
npm run dev
```

## Informations de Connexion
- **Host**: localhost
- **Port**: 5432
- **Database**: TaskManager
- **User**: TaskManager_user
- **Password**: taskmanager_pass
