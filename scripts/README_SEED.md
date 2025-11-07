# 🌱 Système de Seed - Utilisateurs Test Ges-Cab

## 📋 Vue d'ensemble

Ce système permet de créer rapidement des utilisateurs test pour développer et tester l'application Ges-Cab avec PostgreSQL direct.

## 🚀 Utilisation rapide

### Méthode 1 : Script JavaScript (Recommandé)
```bash
# Créer tous les utilisateurs
npm run seed:users

# Ou directement
node scripts/seed-users.js
```

### Méthode 2 : Script SQL direct
```bash
# Via npm
npm run seed:users:sql

# Ou directement  
./seed-users.sh sql
```

### Méthode 3 : Script bash polyvalent
```bash
# JavaScript (par défaut)
./seed-users.sh

# SQL direct
./seed-users.sh sql

# Afficher les infos de connexion
./seed-users.sh info
```

## 👥 Utilisateurs créés

### 🔐 Administrateur principal
- **Email** : `elie.gouzou@gmail.com`
- **Mot de passe** : `admin123`
- **Rôle** : `admin`
- **Fonction** : `Direction`
- **Statut** : Compte actif, prêt à utiliser

### 🧪 Utilisateurs de test

#### 1. Avocat Test
- **Email** : `avocat.test@ges-cab.local`
- **Nom** : Marie Dupont
- **Fonction** : Avocat
- **Mot de passe temporaire** : `TEMP2024`
- **Statut** : Première connexion requise

#### 2. Secrétaire Test  
- **Email** : `secretaire.test@ges-cab.local`
- **Nom** : Jean Martin
- **Fonction** : Secretaire
- **Mot de passe temporaire** : `SECRET2024`
- **Statut** : Première connexion requise

#### 3. Stagiaire Test
- **Email** : `stagiaire.test@ges-cab.local`
- **Nom** : Sophie Durand
- **Fonction** : Stagiaire  
- **Mot de passe temporaire** : `STAGE2024`
- **Statut** : Première connexion requise

## 🔧 Fonctionnement

### Script JavaScript (`scripts/seed-users.js`)
- ✅ Utilise le service d'authentification Ges-Cab
- ✅ Hash automatique des mots de passe (bcrypt)
- ✅ Vérification des doublons
- ✅ Gestion des erreurs complète
- ✅ Compatible avec la structure de base exacte

### Script SQL (`database/seed-users.sql`)
- ✅ Exécution SQL directe
- ✅ Compatibilité multi-structure (Supabase/Custom)
- ✅ Vérifications d'existence
- ✅ Informations détaillées

## 📊 Structure de base supportée

Le système s'adapte automatiquement à votre structure de table `profiles` :

### Structure Ges-Cab (recommandée)
```sql
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    nom VARCHAR(255),
    prenom VARCHAR(255), 
    full_name VARCHAR(255),
    function VARCHAR(255),
    role VARCHAR(50),
    password_hash VARCHAR(255),
    first_login BOOLEAN,
    temp_password VARCHAR(255),
    temp_password_expires_at TIMESTAMPTZ,
    active BOOLEAN,
    created_by INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

### Structure Supabase (alternative)
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

## 🧪 Tests et validation

### Vérifier les utilisateurs créés
```bash
# Afficher les informations
npm run seed:info

# Ou se connecter à PostgreSQL
psql -h localhost -U gouzman -d ges_cab
SELECT email, full_name, role, active FROM profiles;
```

### Tester la connexion
1. Démarrer l'app : `npm run dev`
2. Aller sur : `http://localhost:3000`
3. Se connecter avec `elie.gouzou@gmail.com` / `admin123`
4. Ou tester la première connexion avec un compte temporaire

## 🔒 Sécurité

### Mots de passe
- **Administrateur** : Hash bcrypt (12 rounds) de "admin123"
- **Utilisateurs test** : Mots de passe temporaires en clair
- **Première connexion** : Changement obligatoire vers un mot de passe sécurisé

### Données de test
- Emails avec domaine `.local` pour éviter les conflits
- Comptes clairement identifiés comme "test"
- Pas d'informations sensibles réelles

## 🛠 Personnalisation

### Modifier les utilisateurs
Éditez `scripts/seed-users.js` pour changer :
- Les emails et noms
- Les mots de passe temporaires
- Les rôles et fonctions
- Le nombre d'utilisateurs

### Ajouter des données
Étendez le script pour créer :
- Clients de test
- Dossiers d'exemple  
- Tâches pré-remplies
- Documents types

## 🚨 Dépannage

### Erreur "Table profiles not found"
```bash
# Créer la structure de base
psql -h localhost -U gouzman -d ges_cab -f database/complete_schema.sql
```

### Erreur "bcryptjs not found"  
```bash
# Installer les dépendances
npm install bcryptjs
```

### Erreur de connexion PostgreSQL
```bash
# Vérifier que PostgreSQL fonctionne
./test-auth-system.sh
```

### Utilisateur déjà existant
Le script détecte automatiquement les doublons et affiche un avertissement sans erreur.

## 📝 Exemples d'usage

### Développement
```bash
# Setup rapide pour développer
npm install
./test-auth-system.sh
npm run seed:users
npm run dev
```

### Tests automatisés
```bash
# Dans vos tests
import { seedUsers } from './scripts/seed-users.js';
await seedUsers();
```

### Production (à adapter)
```bash
# Créer seulement l'admin (sans les comptes test)
./seed-users.sh sql  # Modifier le script pour enlever les tests
```

---

💡 **Conseil** : Utilisez `npm run seed:info` pour rappeler rapidement les informations de connexion pendant le développement !