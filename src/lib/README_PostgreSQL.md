# Client PostgreSQL Direct - Guide d'utilisation

## 📋 Vue d'ensemble

Ce guide explique comment utiliser le nouveau client PostgreSQL direct dans Ges-Cab, permettant de se connecter directement à PostgreSQL sans passer par Supabase.

## 🏗️ Architecture

### Fichiers créés
- **`src/lib/dbClient.js`** - Client PostgreSQL principal avec pool de connexions
- **`src/lib/examples/pgExamples.js`** - Exemples d'utilisation et requêtes
- **`src/lib/migrationUtils.js`** - Utilitaires pour la compatibilité Supabase/PostgreSQL

### Configuration
La configuration se fait via les variables d'environnement dans `.env.local` :
```bash
VITE_PG_USER=gouzman
VITE_PG_PASSWORD=               # vide si pas de mot de passe
VITE_PG_HOST=localhost
VITE_PG_PORT=5432
VITE_PG_DATABASE=ges_cab
```

## 🚀 Utilisation

### 1. Client de base (dbClient.js)
```javascript
import { query, getClient, testConnection } from './lib/dbClient.js';

// Requête simple
const users = await query('SELECT * FROM profiles');

// Avec paramètres
const user = await query('SELECT * FROM profiles WHERE email = $1', ['user@example.com']);

// Transaction
const client = await getClient();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO...');
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
} finally {
  client.release();
}
```

### 2. Services pré-construits (migrationUtils.js)
```javascript
import { ProfilesService, TasksService, CasesService } from './lib/migrationUtils.js';

// Gestion des profils
const allProfiles = await ProfilesService.getAll();
const userProfile = await ProfilesService.getByEmail('user@example.com');
const newProfile = await ProfilesService.create({
  email: 'new@example.com',
  nom: 'Dupont',
  prenom: 'Jean',
  role: 'user'
});

// Gestion des tâches
const userTasks = await TasksService.getByUser(1);
const newTask = await TasksService.create({
  title: 'Nouvelle tâche',
  assigned_to: 1,
  priority: 'high'
});

// Gestion des dossiers
const activeCases = await CasesService.getActive();
const clientCases = await CasesService.getByClient(1);
```

### 3. Wrapper universel (DbWrapper)
```javascript
import { DbWrapper } from './lib/migrationUtils.js';

// Compatible Supabase et PostgreSQL
const profiles = await DbWrapper.select('profiles');
const profile = await DbWrapper.select('profiles', '*', { email: 'user@example.com' });

const newProfile = await DbWrapper.insert('profiles', {
  email: 'new@example.com',
  nom: 'Dupont'
});

const updated = await DbWrapper.update('profiles', 
  { nom: 'Nouveau nom' }, 
  { id: 1 }
);

await DbWrapper.delete('profiles', { id: 1 });
```

## 🔄 Migration depuis Supabase

### Remplacement automatique
Le système détecte automatiquement si Supabase est disponible ou non :

```javascript
// Avant (Supabase uniquement)
const { data, error } = await supabase.from('profiles').select('*');
if (error) throw error;

// Après (Compatible Supabase + PostgreSQL)
const profiles = await DbWrapper.select('profiles');
```

### Détection du mode
```javascript
import { connectionMode, isLocal } from './lib/customSupabaseClient.js';

console.log('Mode actuel:', connectionMode); // 'local-postgresql', 'local-supabase', ou 'cloud'
console.log('Mode local:', isLocal); // true/false
```

## 🧪 Tests et diagnostic

### Test de connexion
```javascript
import { testConnection, runConnectionTest } from './lib/examples/pgExamples.js';

// Test simple
const isConnected = await testConnection();

// Test complet avec informations
const testResult = await runConnectionTest();
console.log('Version PostgreSQL:', testResult.version);
console.log('Tables disponibles:', testResult.tables);
```

### Diagnostic complet
```javascript
import { diagnoseConnection } from './lib/migrationUtils.js';

const diagnostic = await diagnoseConnection();
console.log('Statut:', diagnostic.status);
console.log('Mode:', diagnostic.mode);
console.log('Profils trouvés:', diagnostic.profilesCount);
```

## 📊 Exemples pratiques

### Dashboard avec statistiques
```javascript
import { getDashboardStats } from './lib/examples/pgExamples.js';

const stats = await getDashboardStats();
console.log(`Utilisateurs: ${stats.totalUsers}`);
console.log(`Tâches actives: ${stats.activeTasks}`);
console.log(`Dossiers actifs: ${stats.activeCases}`);
```

### Transfert de dossier avec transaction
```javascript
import { transferCase } from './lib/examples/pgExamples.js';

try {
  await transferCase(dossier_id, ancien_user_id, nouveau_user_id);
  console.log('Dossier transféré avec succès');
} catch (error) {
  console.error('Erreur lors du transfert:', error);
}
```

## ⚙️ Configuration avancée

### Pool de connexions personnalisé
```javascript
// Modifier dbClient.js si nécessaire
const pool = new Pool({
  user: process.env.VITE_PG_USER,
  host: process.env.VITE_PG_HOST,
  database: process.env.VITE_PG_DATABASE,
  password: process.env.VITE_PG_PASSWORD,
  port: process.env.VITE_PG_PORT,
  max: 20, // nombre max de connexions
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Debug et logging
Activez le mode debug dans `.env.local` :
```bash
VITE_DEBUG_MODE=true
```

Cela affichera :
- Les requêtes SQL exécutées
- Les temps d'exécution
- Les informations de connexion détaillées

## 🔧 Dépannage

### Erreurs communes

1. **Connexion refusée**
   ```
   ❌ Erreur de connexion à PostgreSQL: connection refused
   ```
   → Vérifiez que PostgreSQL est démarré et accessible sur le port 5432

2. **Base de données inexistante**
   ```
   ❌ Erreur SQL: database "ges_cab" does not exist
   ```
   → Créez la base `ges_cab` dans PostgreSQL

3. **Table inexistante**
   ```
   ❌ Erreur SQL: relation "profiles" does not exist
   ```
   → Exécutez les migrations pour créer les tables

### Commandes utiles
```bash
# Tester la connexion PostgreSQL
psql -h localhost -U gouzman -d ges_cab

# Lister les bases de données
psql -h localhost -U gouzman -l

# Créer la base ges_cab
createdb -h localhost -U gouzman ges_cab
```

## 📚 Ressources

- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Node.js pg driver](https://node-postgres.com/)
- [Configuration Postgres.app](https://postgresapp.com/)

---

*Ce système permet une transition en douceur de Supabase vers PostgreSQL direct tout en maintenant la compatibilité avec le code existant.*