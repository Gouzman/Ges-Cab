#!/bin/bash

echo "🎯 SOLUTION IDENTIFIÉE - Modification de l'enregistrement A principal"
echo "===================================================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}✅ Bonne nouvelle : Votre configuration CNAME est correcte !${NC}"
echo ""
echo "Vous avez :"
echo "- www (CNAME) → ges-cab.com ✅"
echo ""
echo -e "${RED}❌ Problème identifié :${NC}"
echo "Il manque ou il faut modifier l'enregistrement A principal"
echo ""

echo -e "${CYAN}🔍 CE QUE VOUS DEVEZ CHERCHER MAINTENANT :${NC}"
echo "==========================================="
echo ""
echo "Dans votre interface Hostinger, cherchez un enregistrement :"
echo ""
echo -e "${YELLOW}Type: A${NC}"
echo -e "${YELLOW}Nom: @ ${NC}(ou vide, ou ges-cab.com)"
echo -e "${YELLOW}Valeur/IP: ????? ${NC}(probablement 84.32.84.32)"
echo ""

echo -e "${BLUE}📋 ACTIONS À EFFECTUER :${NC}"
echo "========================="
echo ""
echo "1. 🔍 Cherchez l'enregistrement A avec le nom '@' (arobase)"
echo "2. 📝 Si la valeur est 84.32.84.32 → Cliquez sur 'Modifier'"
echo "3. ✏️  Changez la valeur pour : 82.25.116.122"
echo "4. 💾 Cliquez sur 'Mettre à jour' ou 'Sauvegarder'"
echo ""
echo -e "${RED}SI VOUS NE TROUVEZ PAS d'enregistrement A avec '@' :${NC}"
echo "=================================================="
echo ""
echo "Il faut le CRÉER :"
echo "1. 🆕 Cliquez sur 'Ajouter un enregistrement' ou '+ Nouveau'"
echo "2. 📋 Type : A"
echo "3. 📋 Nom : @ (juste le symbole arobase)"
echo "4. 📋 Valeur : 82.25.116.122"
echo "5. 📋 TTL : 300 (ou laisser par défaut)"
echo "6. 💾 Cliquez sur 'Créer' ou 'Ajouter'"
echo ""

echo -e "${YELLOW}⚡ RÉSULTAT ATTENDU APRÈS MODIFICATION :${NC}"
echo "============================================"
echo ""
echo "Vous devriez avoir :"
echo "✅ @ (Type A) → 82.25.116.122"
echo "✅ www (Type CNAME) → ges-cab.com"
echo ""

echo -e "${GREEN}🚀 VÉRIFICATION IMMÉDIATE :${NC}"
echo "============================="
echo ""
echo "Après avoir fait le changement, attendez 2-3 minutes puis :"
echo ""

# Fonction de vérification
check_dns() {
    echo "Vérification en cours..."
    CURRENT_IP=$(dig +short @8.8.8.8 ges-cab.com A)
    echo ""
    if [ "$CURRENT_IP" = "82.25.116.122" ]; then
        echo -e "${GREEN}🎉 SUCCÈS ! ges-cab.com pointe maintenant vers 82.25.116.122${NC}"
        echo -e "${GREEN}🌐 Votre site sera bientôt accessible sur https://ges-cab.com${NC}"
        return 0
    elif [ "$CURRENT_IP" = "84.32.84.32" ]; then
        echo -e "${YELLOW}⏳ Propagation en cours... IP actuelle : 84.32.84.32${NC}"
        echo "Attendez quelques minutes et relancez cette vérification"
        return 1
    else
        echo -e "${RED}🤔 IP inattendue : $CURRENT_IP${NC}"
        echo "Vérifiez votre configuration"
        return 1
    fi
}

echo "Pour vérifier maintenant : ./diagnostic-dns-approfondi.sh"
echo "Pour surveiller en continu : ./monitor-dns-propagation.sh"
echo ""

read -p "Voulez-vous faire une vérification maintenant ? (o/n): " verify_now

if [[ $verify_now == "o" || $verify_now == "O" ]]; then
    check_dns
fi

echo ""
echo -e "${CYAN}📞 BESOIN D'AIDE ?${NC}"
echo "=================="
echo ""
echo "Si vous ne trouvez pas l'enregistrement @ ou si vous avez des doutes :"
echo "1. Faites une capture d'écran de votre interface DNS Hostinger"
echo "2. Montrez-moi tous les enregistrements que vous voyez"
echo ""
echo "L'objectif est d'avoir :"
echo "- ges-cab.com (ou @) → 82.25.116.122 (Type A)"
echo "- www → ges-cab.com (Type CNAME) ✅ déjà fait"