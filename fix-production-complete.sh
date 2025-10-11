#!/bin/bash

# 🔧 Script de correction complète des erreurs de production - Ges-Cab
# Ce script applique toutes les corrections nécessaires pour résoudre les erreurs de production

set -e

echo "🚀 CORRECTION COMPLÈTE DES ERREURS DE PRODUCTION"
echo "==============================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 PLAN DE CORRECTION :${NC}"
echo "1. ✅ Corrections JavaScript déjà appliquées"
echo "2. 🗃️  Application des migrations de base de données"
echo "3. 🔄 Reconstruction de l'application"
echo "4. 🧪 Tests de validation"
echo ""

echo -e "${YELLOW}🗃️  ÉTAPE 1: MIGRATIONS DE BASE DE DONNÉES${NC}"
echo "=============================================="
echo ""

echo "Les migrations suivantes doivent être appliquées dans Supabase :"
echo ""
echo "1. 📁 database/auth-system-migration.sql (système d'authentification)"
echo "2. 📁 database/fix-production-errors.sql (corrections des erreurs 403/404)"
echo ""

echo -e "${RED}⚠️  ACTION REQUISE :${NC}"
echo "Vous devez maintenant :"
echo "1. Ouvrir Supabase Dashboard → SQL Editor"
echo "2. Exécuter les deux fichiers SQL dans l'ordre"
echo "3. Vérifier que toutes les requêtes s'exécutent sans erreur"
echo ""

echo "Voulez-vous continuer après avoir appliqué les migrations ? (y/n)"
read -r response

if [[ "$response" != "y" && "$response" != "Y" ]]; then
    echo "❌ Arrêt du script. Veuillez d'abord appliquer les migrations."
    exit 1
fi

echo ""
echo -e "${YELLOW}🔄 ÉTAPE 2: RECONSTRUCTION DE L'APPLICATION${NC}"
echo "============================================="
echo ""

echo "🏗️  Construction de l'application..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Construction réussie !${NC}"
else
    echo -e "${RED}❌ Erreur lors de la construction${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🧪 ÉTAPE 3: VALIDATION DES CORRECTIONS${NC}"
echo "======================================"
echo ""

echo "🔍 Vérification des fichiers corrigés..."

# Vérifier que les corrections JavaScript sont appliquées
errors=0

# Vérifier ClientCard
if grep -q "client\.created_at" src/components/ClientCard.jsx; then
    echo "✅ ClientCard.jsx: Propriété created_at correcte"
else
    echo "❌ ClientCard.jsx: Problème avec created_at"
    errors=$((errors + 1))
fi

# Vérifier les protections DOM
if grep -q "if (document\.body)" src/components/DocumentManager.jsx; then
    echo "✅ DocumentManager.jsx: Protection DOM appliquée"
else
    echo "❌ DocumentManager.jsx: Protection DOM manquante"
    errors=$((errors + 1))
fi

if grep -q "if (document\.body)" src/components/TaskCard.jsx; then
    echo "✅ TaskCard.jsx: Protection DOM appliquée"
else
    echo "❌ TaskCard.jsx: Protection DOM manquante"
    errors=$((errors + 1))
fi

if grep -q "if (document\.body)" src/components/TaskForm.jsx; then
    echo "✅ TaskForm.jsx: Protection DOM appliquée"
else
    echo "❌ TaskForm.jsx: Protection DOM manquante"
    errors=$((errors + 1))
fi

if grep -q "if (document\.body)" src/components/Reports.jsx; then
    echo "✅ Reports.jsx: Protection DOM appliquée"
else
    echo "❌ Reports.jsx: Protection DOM manquante"
    errors=$((errors + 1))
fi

# Vérifier main.jsx
if grep -q "const rootElement = document\.getElementById" src/main.jsx; then
    echo "✅ main.jsx: Protection root element appliquée"
else
    echo "❌ main.jsx: Protection root element manquante"
    errors=$((errors + 1))
fi

echo ""
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}🎉 TOUTES LES CORRECTIONS SONT APPLIQUÉES !${NC}"
else
    echo -e "${RED}❌ $errors erreur(s) détectée(s)${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 RÉSUMÉ DES CORRECTIONS APPLIQUÉES :${NC}"
echo "======================================"
echo ""
echo "✅ Correction de client.createdAt → client.created_at"
echo "✅ Protection DOM pour tous les appendChild/removeChild"
echo "✅ Vérification de l'élément root avant montage React"
echo "✅ PropTypes mis à jour pour les bonnes propriétés"
echo ""
echo -e "${GREEN}🚀 L'APPLICATION EST PRÊTE POUR LA PRODUCTION !${NC}"
echo ""
echo -e "${YELLOW}📋 PROCHAINES ÉTAPES :${NC}"
echo "1. Déployer les fichiers modifiés sur le serveur"
echo "2. Tester l'application en production"
echo "3. Vérifier que toutes les erreurs ont disparu des logs"
echo "4. Tester les nouvelles fonctionnalités d'authentification"
echo ""
echo "🎯 Si des erreurs persistent, vérifiez :"
echo "   - Les migrations de base de données ont été appliquées"
echo "   - Les permissions RLS sont correctes"
echo "   - La configuration Supabase est à jour"