# 🗄️ Guide Supabase - Ges-Cab

## Installation et Configuration

Supabase CLI est maintenant installé et configuré pour votre projet Ges-Cab.

### 🚀 Commandes Disponibles

```bash
# Gestion générale
npm run supabase           # Affiche l'aide du gestionnaire Supabase
npm run supabase start     # Démarre l'environnement local
npm run supabase stop      # Arrête l'environnement local

# Base de données
npm run db:start           # Démarre la base de données locale
npm run db:stop            # Arrête la base de données locale
npm run db:reset           # Réinitialise la base avec les migrations
npm run db:migrate         # Applique les migrations
npm run db:seed            # Charge les données de test
npm run db:studio          # Ouvre Supabase Studio
```

### 📋 Étapes de Configuration

#### 1. Environnement Local

```bash
# Démarrer Supabase en local
npm run db:start

# Ouvrir l'interface d'administration
npm run db:studio
```

**URLs locales :**
- API : `http://localhost:54321`
- Studio : `http://localhost:54323`
- Base de données : `postgresql://USER:PASSWORD@localhost:54322/DATABASE`

#### 2. Projet Distant (Production)

1. **Créer un projet sur Supabase** :
   - Aller sur https://app.supabase.com
   - Créer un nouveau projet
   - Noter l'URL et la clé anonyme

2. **Lier le projet local** :
   ```bash
   npm run supabase link
   ```

3. **Déployer les migrations** :
   ```bash
   npm run supabase deploy
   ```

### 🏗️ Structure de la Base de Données

#### Tables Principales

1. **profiles** - Profils utilisateurs
   - `id` (UUID, référence vers auth.users)
   - `name` (TEXT)
   - `role` (TEXT) : 'user', 'admin', 'manager'

2. **clients** - Clients du cabinet
   - `id` (UUID)
   - `name`, `email`, `phone`, `address`, `company`
   - `created_by` (référence vers profiles)

3. **cases** - Dossiers juridiques
   - `id` (UUID)
   - `title`, `description`, `status`, `type`
   - `client_id` (référence vers clients)
   - `created_by`, `assigned_to` (références vers profiles)

4. **tasks** - Tâches
   - `id` (UUID)
   - `title`, `description`, `priority`, `status`
   - `deadline`, `attachments`
   - `assigned_to_id`, `case_id`, `created_by`

5. **events** - Événements calendrier
   - `id` (UUID)
   - `title`, `description`, `start_date`, `end_date`
   - `created_by`, `attendees` (array d'UUID)

6. **documents** - Documents attachés
   - `id` (UUID)
   - `name`, `file_path`, `file_size`, `mime_type`
   - `case_id`, `uploaded_by`

### 🔐 Sécurité (RLS)

Toutes les tables ont Row Level Security (RLS) activé avec des politiques appropriées :

- **Lecture** : Tous les utilisateurs connectés peuvent voir les données
- **Création** : Les utilisateurs peuvent créer des enregistrements
- **Modification** : Permissions basées sur le rôle et la propriété
- **Suppression** : Réservée aux créateurs et aux admins/managers

### 📊 Données de Test

Le fichier `supabase/seed.sql` contient des données de démonstration :
- 5 clients de test
- 5 dossiers juridiques
- 7 tâches avec différents statuts
- 5 événements calendrier

### 🔧 Variables d'Environnement

Pour la production, configurez ces variables :

```bash
# Dans .env.production
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anonyme
```

### 🐛 Dépannage

#### Base de données ne démarre pas
```bash
npm run db:stop
npm run db:start
```

#### Erreurs de migration
```bash
npm run db:reset  # Recrée la base avec toutes les migrations
```

#### Problèmes de permissions
Vérifiez les politiques RLS dans Supabase Studio

### 📞 Support

- **Documentation** : https://supabase.com/docs
- **Dashboard** : https://app.supabase.com
- **Community** : https://github.com/supabase/supabase/discussions

---

## 🎯 Utilisation avec Ges-Cab

1. **Développement** : Utilisez l'environnement local
2. **Test** : Chargez les données de démonstration
3. **Production** : Liez et déployez vers Supabase Cloud

Votre base de données est maintenant prête pour supporter toutes les fonctionnalités de Ges-Cab ! 🚀