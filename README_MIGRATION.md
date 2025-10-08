# 🛠️ Guide de Migration Base de Données - Ges-Cab

## 📋 Résumé de la Situation

L'analyse du code révèle que plusieurs colonnes nécessaires au bon fonctionnement de l'application manquent dans la base de données Supabase.

### 📊 État Actuel des Tables

| Table | Colonnes Actuelles | Colonnes Manquantes | Statut |
|-------|-------------------|-------------------|---------|
| **clients** | 14 colonnes | `updated_at` | 🟡 Presque complet |
| **cases** | 5 colonnes | 12 colonnes critiques | 🔴 Très incomplet |
| **tasks** | 17 colonnes | Aucune | ✅ Complet |
| **profiles** | 10 colonnes | `title` | 🟡 Presque complet |

### 🎯 Colonnes Manquantes Critiques pour `cases`

```sql
- updated_at (TIMESTAMPTZ)
- description (TEXT)
- type (TEXT)
- client (TEXT)
- opposing_party (TEXT)
- start_date (TIMESTAMPTZ)
- expected_end_date (TIMESTAMPTZ)
- hourly_rate (DECIMAL)
- total_hours (DECIMAL)
- notes (TEXT)
- visible_to (JSONB)
- created_by (TEXT)
```

## 🚀 Instructions de Migration

### Étape 1: Exécuter les Migrations SQL

1. **Connectez-vous à votre tableau de bord Supabase**
2. **Allez dans "SQL Editor"**
3. **Exécutez les commandes suivantes une par une:**

```sql
-- Clients: Ajouter updated_at
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Cases: Ajouter toutes les colonnes manquantes
ALTER TABLE cases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE cases ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS client TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS opposing_party TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS expected_end_date TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS total_hours DECIMAL;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS visible_to JSONB DEFAULT '[]';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Profiles: Ajouter title
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS title TEXT;
```

### Étape 2: Vérifier la Migration

```bash
# Vérifier que les colonnes ont été ajoutées
node verify-migration.mjs

# Test rapide des tables
node verify-migration.mjs --quick
```

### Étape 3: Restaurer les Composants Complets

Une fois les migrations réussies :

```bash
# Sauvegarder les versions actuelles
mv src/components/CaseForm.jsx src/components/CaseForm_backup.jsx
mv src/components/CaseManager.jsx src/components/CaseManager_backup.jsx

# Restaurer les versions complètes
mv src/components/CaseForm_FULL.jsx src/components/CaseForm.jsx
mv src/components/CaseManager_FULL.jsx src/components/CaseManager.jsx
```

## 📁 Fichiers de Migration Générés

| Fichier | Description |
|---------|-------------|
| `migration.sql` | Script SQL complet avec toutes les migrations |
| `analyze-db-structure.mjs` | Script d'analyse des colonnes manquantes |
| `apply-critical-updates.mjs` | Test des modifications critiques |
| `verify-migration.mjs` | Vérification post-migration |
| `restore-full-functionality.mjs` | Génération des composants complets |
| `CaseForm_FULL.jsx` | Formulaire complet avec tous les champs |
| `CaseManager_FULL.jsx` | Gestionnaire complet avec filtres avancés |

## 🧪 Scripts de Test Disponibles

```bash
# Analyse complète de la structure
node analyze-db-structure.mjs

# Test des modifications critiques
node apply-critical-updates.mjs
node apply-critical-updates.mjs --test
node apply-critical-updates.mjs --manual

# Vérification post-migration
node verify-migration.mjs
node verify-migration.mjs --quick

# Restauration des fonctionnalités
node restore-full-functionality.mjs
```

## ✨ Nouvelles Fonctionnalités Après Migration

### 📋 Gestion Complète des Dossiers
- ✅ Formulaire complet avec tous les champs métier
- ✅ Types de dossiers (civil, pénal, commercial, etc.)
- ✅ Gestion des parties (client, partie adverse)
- ✅ Suivi temporel (dates de début/fin)
- ✅ Facturation intégrée (taux horaire, heures totales)
- ✅ Notes et description détaillées
- ✅ Gestion de la visibilité par équipe

### 🔍 Filtres et Recherche Avancés
- ✅ Filtrage par statut, type, client
- ✅ Recherche textuelle dans titre/description
- ✅ Tri par date, priorité, statut
- ✅ Vue d'ensemble avec statistiques

### 💼 Intégration Métier
- ✅ Lien avec les clients existants
- ✅ Attribution aux membres de l'équipe
- ✅ Suivi des tâches par dossier
- ✅ Calcul automatique des honoraires

## 🚨 Points d'Attention

### Avant Migration
- ⚠️ Les formulaires de dossiers sont simplifiés (fonctionnalité réduite)
- ⚠️ Certains champs ne sont pas sauvegardés
- ⚠️ Les filtres avancés ne fonctionnent pas

### Après Migration
- ✅ Fonctionnalité complète restaurée
- ✅ Tous les champs métier disponibles
- ✅ Filtres et recherche optimaux
- ✅ Intégration complète avec les autres modules

## 🔧 Dépannage

### Si la migration échoue
1. Vérifiez vos permissions Supabase
2. Exécutez les commandes SQL une par une
3. Consultez les logs d'erreur
4. Utilisez `node verify-migration.mjs --quick` pour diagnostiquer

### Si les composants ne fonctionnent pas
1. Vérifiez que toutes les colonnes sont présentes
2. Consultez la console pour les erreurs JavaScript
3. Vérifiez les imports et dépendances
4. Restaurez les backups si nécessaire

## 📞 Support

En cas de problème :
1. Vérifiez d'abord avec les scripts de test
2. Consultez les logs Supabase
3. Vérifiez la structure exacte des tables
4. Comparez avec les attentes du code

---

🎉 **Une fois la migration terminée, votre application Ges-Cab disposera d'un système de gestion de dossiers complet et professionnel !**