#!/bin/bash

# 🎯 Script de création et application de patch pour les corrections de production
# Facilite le déploiement des corrections en production

set -e

echo "📦 CRÉATION DU PATCH DE CORRECTIONS"
echo "================================="
echo ""

# Créer un répertoire pour les patches s'il n'existe pas
mkdir -p patches

# Créer un patch avec toutes les corrections appliquées
echo "🔧 Création du patch des corrections JavaScript..."

# Créer un fichier récapitulatif des corrections
cat > patches/corrections-production-summary.md << 'EOF'
# 🔧 Corrections de Production - Ges-Cab

## 📋 Résumé des Corrections Appliquées

### 1. Corrections JavaScript

#### ✅ ClientCard.jsx
- **Problème** : Référence à `client.createdAt` inexistante
- **Solution** : Changé pour `client.created_at` (nom correct dans Supabase)
- **Impact** : Supprime l'erreur "Cannot read property of undefined"

#### ✅ Protections DOM
- **Fichiers affectés** : DocumentManager.jsx, TaskCard.jsx, TaskForm.jsx, Reports.jsx
- **Problème** : Tentatives d'accès à `document.body` potentiellement null
- **Solution** : Ajout de vérifications `if (document.body)` avant manipulation
- **Impact** : Évite les erreurs "Cannot read property 'appendChild' of null"

#### ✅ main.jsx
- **Problème** : Pas de vérification de l'existence de l'élément root
- **Solution** : Vérification avant createRoot()
- **Impact** : Évite les erreurs au chargement initial

### 2. Corrections Base de Données (à appliquer séparément)

#### 📁 database/auth-system-migration.sql
- Système d'authentification avancé
- Fonctions PL/pgSQL pour gestion des utilisateurs
- Tables et permissions nécessaires

#### 📁 database/fix-production-errors.sql
- Correction des erreurs 403 Supabase
- Création de la table app_metadata manquante
- Mise à jour des politiques RLS
- Ajout des colonnes manquantes

### 3. Files Modifiés

```
src/main.jsx                    - Protection élément root
src/components/ClientCard.jsx   - Correction propriété created_at
src/components/DocumentManager.jsx - Protection DOM
src/components/TaskCard.jsx     - Protection DOM
src/components/TaskForm.jsx     - Protection DOM
src/components/Reports.jsx      - Protection DOM
```

### 4. Instructions de Déploiement

1. **Appliquer les corrections JavaScript** (déjà fait)
2. **Appliquer les migrations SQL** dans Supabase Dashboard
3. **Rebuilder l'application** : `npm run build`
4. **Déployer les fichiers** modifiés
5. **Tester en production**

### 5. Tests de Validation

- [ ] Vérifier que les erreurs 403 ont disparu
- [ ] Tester la création de clients (propriété created_at)
- [ ] Tester les téléchargements de fichiers
- [ ] Vérifier le système d'authentification
- [ ] Contrôler les logs de la console navigateur

EOF

echo "✅ Résumé créé dans patches/corrections-production-summary.md"

# Créer un script de validation rapide
cat > patches/validate-corrections.js << 'EOF'
#!/usr/bin/env node

/**
 * Script de validation des corrections appliquées
 */

import fs from 'fs';
import path from 'path';

const VALIDATIONS = [
  {
    file: 'src/main.jsx',
    check: 'const rootElement = document.getElementById',
    description: 'Protection élément root'
  },
  {
    file: 'src/components/ClientCard.jsx',
    check: 'client.created_at',
    description: 'Propriété created_at correcte'
  },
  {
    file: 'src/components/DocumentManager.jsx',
    check: 'if (document.body)',
    description: 'Protection DOM DocumentManager'
  },
  {
    file: 'src/components/TaskCard.jsx',
    check: 'if (document.body)',
    description: 'Protection DOM TaskCard'
  },
  {
    file: 'src/components/TaskForm.jsx',
    check: 'if (document.body)',
    description: 'Protection DOM TaskForm'
  },
  {
    file: 'src/components/Reports.jsx',
    check: 'if (document.body)',
    description: 'Protection DOM Reports'
  }
];

console.log('🧪 VALIDATION DES CORRECTIONS\n');

let allPassed = true;

VALIDATIONS.forEach(({ file, check, description }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(check)) {
      console.log(`✅ ${description}`);
    } else {
      console.log(`❌ ${description} - ÉCHEC`);
      allPassed = false;
    }
  } else {
    console.log(`⚠️  ${file} - Fichier non trouvé`);
    allPassed = false;
  }
});

console.log('\n' + (allPassed ? '🎉 TOUTES LES VALIDATIONS PASSÉES !' : '❌ CERTAINES VALIDATIONS ONT ÉCHOUÉ'));
process.exit(allPassed ? 0 : 1);
EOF

chmod +x patches/validate-corrections.js

echo "✅ Script de validation créé dans patches/validate-corrections.js"

# Créer un script de déploiement rapide
cat > patches/deploy-corrections.sh << 'EOF'
#!/bin/bash

# Script de déploiement rapide des corrections

echo "🚀 DÉPLOIEMENT DES CORRECTIONS"
echo "============================="
echo ""

# Validation des corrections
echo "🧪 Validation des corrections..."
node patches/validate-corrections.js

if [ $? -ne 0 ]; then
    echo "❌ Validation échouée. Arrêt du déploiement."
    exit 1
fi

echo ""
echo "🏗️  Construction de l'application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la construction"
    exit 1
fi

echo ""
echo "✅ Corrections prêtes pour le déploiement !"
echo ""
echo "📋 Actions manuelles requises :"
echo "1. Appliquer database/auth-system-migration.sql dans Supabase"
echo "2. Appliquer database/fix-production-errors.sql dans Supabase"
echo "3. Déployer les fichiers du dossier dist/ sur le serveur"
echo "4. Tester l'application en production"
EOF

chmod +x patches/deploy-corrections.sh

echo "✅ Script de déploiement créé dans patches/deploy-corrections.sh"

echo ""
echo "📦 PATCH CRÉÉ AVEC SUCCÈS !"
echo "=========================="
echo ""
echo "📁 Fichiers créés dans patches/ :"
echo "  - corrections-production-summary.md (résumé des corrections)"
echo "  - validate-corrections.js (validation automatique)"
echo "  - deploy-corrections.sh (déploiement guidé)"
echo ""
echo "🚀 Pour déployer les corrections :"
echo "   ./patches/deploy-corrections.sh"
echo ""
echo "🧪 Pour valider seulement :"
echo "   node patches/validate-corrections.js"