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
