#!/bin/bash

echo "🧹 GUIDE COMPLET - SUPPRESSION DU CACHE NAVIGATEUR"
echo "=================================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 DÉTECTION AUTOMATIQUE DE VOTRE SYSTÈME :${NC}"
echo "=============================================="
echo ""

# Détecter l'OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
    SHORTCUT_RELOAD="Cmd+Shift+R"
    SHORTCUT_DEV="Cmd+Option+I"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    SHORTCUT_RELOAD="Ctrl+Shift+R"
    SHORTCUT_DEV="Ctrl+Shift+I"
else
    OS="Windows"
    SHORTCUT_RELOAD="Ctrl+Shift+R"
    SHORTCUT_DEV="F12"
fi

echo -e "${GREEN}Système détecté : $OS${NC}"
echo ""

echo -e "${CYAN}🚀 MÉTHODE RAPIDE (RECOMMANDÉE) :${NC}"
echo "================================="
echo ""
echo -e "${YELLOW}1. ACTUALISATION FORCÉE${NC}"
echo "Appuyez sur : ${GREEN}$SHORTCUT_RELOAD${NC}"
echo "Cette combinaison force le rechargement sans utiliser le cache"
echo ""

echo -e "${YELLOW}2. NAVIGATION PRIVÉE${NC}"
echo "Ouvrez un onglet en navigation privée/incognito :"
if [[ "$OS" == "macOS" ]]; then
    echo "• Safari : Cmd+Shift+N"
    echo "• Chrome : Cmd+Shift+N"
    echo "• Firefox : Cmd+Shift+P"
else
    echo "• Chrome : Ctrl+Shift+N"
    echo "• Firefox : Ctrl+Shift+P"
    echo "• Edge : Ctrl+Shift+N"
fi
echo "Puis testez : https://ges-cab.com"
echo ""

echo -e "${CYAN}🔧 MÉTHODE COMPLÈTE PAR NAVIGATEUR :${NC}"
echo "====================================="
echo ""

echo -e "${GREEN}🌐 GOOGLE CHROME${NC}"
echo "----------------"
if [[ "$OS" == "macOS" ]]; then
    echo "1. Chrome → Préférences (ou Cmd+,)"
    echo "2. Confidentialité et sécurité → Effacer les données de navigation"
    echo "3. Période : 'Dernière heure' ou 'Toutes les périodes'"
    echo "4. Cocher : 'Images et fichiers en cache'"
    echo "5. Cliquer 'Effacer les données'"
else
    echo "1. Menu ⋮ → Paramètres (ou Ctrl+,)"
    echo "2. Confidentialité et sécurité → Effacer les données de navigation"
    echo "3. Période : 'Dernière heure' ou 'Toutes les périodes'"
    echo "4. Cocher : 'Images et fichiers en cache'"
    echo "5. Cliquer 'Effacer les données'"
fi
echo ""

echo -e "${GREEN}🦊 MOZILLA FIREFOX${NC}"
echo "-------------------"
if [[ "$OS" == "macOS" ]]; then
    echo "1. Firefox → Préférences (ou Cmd+,)"
    echo "2. Vie privée et sécurité → Cookies et données de sites"
    echo "3. Cliquer 'Effacer les données...'"
    echo "4. Cocher 'Contenu web en cache'"
    echo "5. Cliquer 'Effacer'"
else
    echo "1. Menu ≡ → Paramètres (ou Ctrl+,)"
    echo "2. Vie privée et sécurité → Cookies et données de sites"
    echo "3. Cliquer 'Effacer les données...'"
    echo "4. Cocher 'Contenu web en cache'"
    echo "5. Cliquer 'Effacer'"
fi
echo ""

if [[ "$OS" == "macOS" ]]; then
    echo -e "${GREEN}🧭 SAFARI${NC}"
    echo "----------"
    echo "1. Safari → Préférences → Avancées"
    echo "2. Cocher 'Afficher le menu Développement'"
    echo "3. Menu Développement → Vider les caches"
    echo "OU"
    echo "1. Safari → Effacer l'historique..."
    echo "2. Choisir 'toute la période'"
    echo "3. Cliquer 'Effacer l'historique'"
    echo ""
fi

echo -e "${GREEN}🔷 MICROSOFT EDGE${NC}"
echo "------------------"
if [[ "$OS" == "macOS" ]]; then
    echo "1. Edge → Préférences (ou Cmd+,)"
else
    echo "1. Menu ... → Paramètres (ou Ctrl+,)"
fi
echo "2. Confidentialité, recherche et services"
echo "3. Effacer les données de navigation → Choisir les éléments à effacer"
echo "4. Cocher 'Images et fichiers mis en cache'"
echo "5. Cliquer 'Effacer maintenant'"
echo ""

echo -e "${CYAN}🛠️  MÉTHODE DÉVELOPPEUR (AVANCÉE) :${NC}"
echo "==================================="
echo ""
echo "1. Ouvrez les outils de développement : ${GREEN}$SHORTCUT_DEV${NC}"
echo "2. Onglet 'Network' ou 'Réseau'"
echo "3. Clic droit sur la page → 'Reload' → 'Empty Cache and Hard Reload'"
echo "   (Chrome) ou équivalent dans votre navigateur"
echo ""

echo -e "${YELLOW}🎯 SOLUTION SPÉCIFIQUE POUR GES-CAB :${NC}"
echo "========================================="
echo ""

# Créer un script de test immédiat
cat > test-cache-cleared.sh << 'EOF'
#!/bin/bash

echo "🧪 TEST APRÈS SUPPRESSION DU CACHE"
echo "=================================="
echo ""

echo "Testez maintenant ces URLs dans votre navigateur :"
echo ""
echo "🔗 https://ges-cab.com"
echo "🔗 https://www.ges-cab.com"
echo ""

echo "Si ça fonctionne :"
echo "✅ Problème résolu ! C'était bien le cache."
echo ""
echo "Si ça ne fonctionne toujours pas :"
echo "1. Essayez en navigation privée"
echo "2. Testez depuis votre téléphone (4G)"
echo "3. Relancez le diagnostic : ./diagnostic-urgence.sh"
echo ""

# Test automatique
echo "Test automatique en cours..."
if curl -f -s https://ges-cab.com > /dev/null 2>&1; then
    echo "✅ Le serveur répond correctement"
    echo "Si vous voyez encore l'erreur, c'est définitivement un problème de cache local"
else
    echo "❌ Le serveur ne répond pas"
    echo "Le problème n'est pas uniquement le cache"
fi
EOF

chmod +x test-cache-cleared.sh

echo "✅ Script de test créé : ./test-cache-cleared.sh"
echo ""

echo -e "${BLUE}📋 RÉSUMÉ DES ÉTAPES :${NC}"
echo "======================"
echo ""
echo "1. 🚀 RAPIDE : Appuyez sur ${GREEN}$SHORTCUT_RELOAD${NC} sur https://ges-cab.com"
echo "2. 🔄 ALTERNATIF : Navigation privée + tester le site"
echo "3. 🧹 COMPLET : Suivez les instructions pour votre navigateur ci-dessus"
echo "4. 🧪 TEST : Lancez ./test-cache-cleared.sh après avoir vidé le cache"
echo ""

echo -e "${GREEN}🎯 COMMENCEZ PAR L'ÉTAPE 1 !${NC}"
echo "C'est la solution la plus rapide et efficace dans 90% des cas."
echo ""

read -p "Appuyez sur ENTRÉE après avoir essayé l'actualisation forcée ($SHORTCUT_RELOAD)..."

echo ""
echo "🧪 Test automatique du serveur..."
if curl -f -s https://ges-cab.com > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Le serveur fonctionne parfaitement !${NC}"
    echo "Si vous voyez encore l'erreur, c'est bien un problème de cache local."
    echo "Continuez avec les méthodes de suppression de cache ci-dessus."
else
    echo -e "${RED}❌ Le serveur ne répond pas actuellement${NC}"
    echo "Le problème n'est pas seulement le cache."
    echo "Lancez : ./diagnostic-urgence.sh pour plus d'informations"
fi