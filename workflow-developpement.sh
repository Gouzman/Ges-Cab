#!/bin/bash

echo "🛠️  WORKFLOW DE DÉVELOPPEMENT - MODIFICATIONS EN COURS"
echo "======================================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Vérifier la branche actuelle
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${GREEN}📍 Branche actuelle : $CURRENT_BRANCH${NC}"

if [[ $CURRENT_BRANCH == "feature/"* ]]; then
    echo -e "${GREEN}✅ Parfait ! Vous êtes sur une branche de fonctionnalité${NC}"
    echo -e "${BLUE}🚀 Votre site en production reste intact : https://ges-cab.com${NC}"
elif [[ $CURRENT_BRANCH == "develop" ]]; then
    echo -e "${YELLOW}⚠️  Vous êtes sur develop. Créez une branche feature pour vos modifications${NC}"
    read -p "Nom de la fonctionnalité à développer : " feature_name
    if [ ! -z "$feature_name" ]; then
        git checkout -b "feature/$feature_name"
        echo -e "${GREEN}✅ Branche feature/$feature_name créée${NC}"
    fi
elif [[ $CURRENT_BRANCH == "main" ]]; then
    echo -e "${RED}⚠️  ATTENTION ! Vous êtes sur la branche main (production)${NC}"
    echo "Il faut créer une branche feature pour vos modifications"
    read -p "Nom de la fonctionnalité à développer : " feature_name
    if [ ! -z "$feature_name" ]; then
        git checkout develop
        git pull origin develop
        git checkout -b "feature/$feature_name"
        echo -e "${GREEN}✅ Branche feature/$feature_name créée depuis develop${NC}"
    fi
fi

echo ""
echo -e "${CYAN}🔄 WORKFLOW DE DÉVELOPPEMENT :${NC}"
echo "=============================="
echo ""

echo -e "${YELLOW}1. DÉVELOPPEMENT${NC}"
echo "----------------"
echo "✅ Vous pouvez maintenant modifier vos fichiers librement"
echo "✅ Votre site en production n'est pas affecté"
echo "✅ Testez localement : npm run dev"
echo ""

echo -e "${YELLOW}2. SAUVEGARDE RÉGULIÈRE${NC}"
echo "-----------------------"
echo "Faites des commits réguliers :"
echo ""
echo "# Ajouter vos modifications"
echo "git add ."
echo ""
echo "# Commit avec un message descriptif"
echo "git commit -m \"feat: description de votre modification\""
echo ""
echo "# Push vers GitHub"
echo "git push origin $(git branch --show-current)"
echo ""

echo -e "${YELLOW}3. TYPES DE COMMITS RECOMMANDÉS${NC}"
echo "--------------------------------"
echo "feat: nouvelle fonctionnalité"
echo "fix: correction de bug"
echo "refactor: refactorisation du code"
echo "style: modifications visuelles/CSS"
echo "docs: mise à jour documentation"
echo "test: ajout de tests"
echo ""

echo -e "${YELLOW}4. QUAND VOUS AVEZ TERMINÉ${NC}"
echo "----------------------------"
echo "1. 💾 Dernier commit et push"
echo "2. 🌐 Aller sur GitHub : https://github.com/Gouzman/Ges-Cab"
echo "3. 📝 Créer une Pull Request vers la branche 'develop'"
echo "4. 🔍 Review du code (optionnel si vous travaillez seul)"
echo "5. ✅ Merge vers develop"
echo "6. 🧪 Test sur staging (optionnel)"
echo "7. 📝 Pull Request develop → main"
echo "8. 🚀 Déploiement automatique en production !"
echo ""

echo -e "${BLUE}🛠️  COMMANDES UTILES PENDANT LE DÉVELOPPEMENT :${NC}"
echo "==============================================="
echo ""
echo "# Voir l'état de vos modifications"
echo "git status"
echo ""
echo "# Voir les différences"
echo "git diff"
echo ""
echo "# Lancer le serveur de développement"
echo "npm run dev"
echo ""
echo "# Tester le build"
echo "npm run build"
echo ""
echo "# Voir l'historique des commits"
echo "git log --oneline"
echo ""

echo -e "${GREEN}🎯 OBJECTIF :${NC}"
echo "============="
echo "Développez tranquillement vos modifications sur cette branche"
echo "Le site en production reste stable et accessible"
echo "Une fois terminé, nous déploierons automatiquement via CI/CD"
echo ""

echo -e "${CYAN}💡 CONSEILS :${NC}"
echo "============="
echo "✅ Commitez souvent (petits commits fréquents)"
echo "✅ Testez localement avant de pusher"
echo "✅ Écrivez des messages de commit clairs"
echo "✅ N'hésitez pas à pousser vers GitHub régulièrement"
echo ""

echo -e "${YELLOW}🚨 EN CAS DE PROBLÈME :${NC}"
echo "======================="
echo "Si vous avez un souci, vous pouvez toujours :"
echo "1. Revenir à develop : git checkout develop"
echo "2. Créer une nouvelle branche : git checkout -b feature/nouveau-nom"
echo "3. Le site en production reste intact !"
echo ""

# Vérifier s'il y a des modifications non commitées
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}📝 MODIFICATIONS DÉTECTÉES :${NC}"
    echo "============================"
    git status --short
    echo ""
    echo "Vous pouvez les commiter avec :"
    echo "git add . && git commit -m \"feat: description de vos modifications\""
fi

echo -e "${GREEN}🚀 VOUS POUVEZ MAINTENANT DÉVELOPPER !${NC}"