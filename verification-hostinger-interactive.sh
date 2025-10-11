#!/bin/bash

echo "🔍 GUIDE DE VÉRIFICATION HOSTINGER - ÉTAPE PAR ÉTAPE"
echo "===================================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${RED}⚠️  PROBLÈME DÉTECTÉ:${NC}"
echo "Le changement DNS n'a pas été effectué correctement."
echo "Tous les serveurs DNS publics voient encore 84.32.84.32"
echo ""

echo -e "${CYAN}📋 CHECKLIST DE VÉRIFICATION HOSTINGER:${NC}"
echo "========================================="
echo ""

echo -e "${YELLOW}ÉTAPE 1: CONNEXION${NC}"
echo "-------------------"
echo "✅ Allez sur: https://hpanel.hostinger.com/"
echo "✅ Connectez-vous avec vos identifiants"
echo ""
read -p "Appuyez sur ENTRÉE quand vous êtes connecté..."

echo ""
echo -e "${YELLOW}ÉTAPE 2: ACCÈS AU DOMAINE${NC}"
echo "-------------------------"
echo "✅ Dans le menu principal, cliquez sur 'Domaines'"
echo "✅ Trouvez 'ges-cab.com' dans la liste"
echo "✅ Cliquez sur 'Gérer' ou sur le domaine directement"
echo ""
read -p "Appuyez sur ENTRÉE quand vous êtes sur la page du domaine..."

echo ""
echo -e "${YELLOW}ÉTAPE 3: ACCÈS AUX DNS${NC}"
echo "----------------------"
echo "✅ Cherchez l'onglet ou le bouton 'DNS Zone Editor' ou 'Zones DNS'"
echo "✅ Cliquez dessus"
echo ""
echo -e "${BLUE}🔍 Vous devriez voir une liste d'enregistrements DNS${NC}"
read -p "Appuyez sur ENTRÉE quand vous voyez les enregistrements DNS..."

echo ""
echo -e "${YELLOW}ÉTAPE 4: VÉRIFICATION DES ENREGISTREMENTS A${NC}"
echo "----------------------------------------------"
echo ""
echo -e "${RED}🎯 CHERCHEZ CES ENREGISTREMENTS:${NC}"
echo ""
echo "1. Enregistrement avec nom '@' ou vide:"
echo "   Type: A"
echo "   Nom: @ (ou vide, ou ges-cab.com)"
echo "   Valeur: DOIT ÊTRE 82.25.116.122"
echo ""
echo "2. Enregistrement avec nom 'www':"
echo "   Type: A" 
echo "   Nom: www"
echo "   Valeur: DOIT ÊTRE 82.25.116.122"
echo ""
read -p "Avez-vous trouvé ces enregistrements ? (o/n): " found_records

if [[ $found_records == "o" || $found_records == "O" ]]; then
    echo ""
    echo -e "${GREEN}✅ Parfait !${NC} Maintenant vérifiez les valeurs:"
    echo ""
    read -p "L'enregistrement '@' a-t-il la valeur 82.25.116.122 ? (o/n): " record_root
    read -p "L'enregistrement 'www' a-t-il la valeur 82.25.116.122 ? (o/n): " record_www
    
    if [[ $record_root == "n" || $record_root == "N" ]]; then
        echo ""
        echo -e "${RED}❌ PROBLÈME TROUVÉ avec l'enregistrement '@'${NC}"
        echo "1. Cliquez sur l'icône de modification (crayon) à côté de l'enregistrement '@'"
        echo "2. Changez la valeur pour: 82.25.116.122"
        echo "3. Cliquez sur 'Sauvegarder' ou 'Enregistrer'"
        echo ""
        read -p "Appuyez sur ENTRÉE après avoir fait le changement..."
    fi
    
    if [[ $record_www == "n" || $record_www == "N" ]]; then
        echo ""
        echo -e "${RED}❌ PROBLÈME TROUVÉ avec l'enregistrement 'www'${NC}"
        echo "1. Cliquez sur l'icône de modification (crayon) à côté de l'enregistrement 'www'"
        echo "2. Changez la valeur pour: 82.25.116.122"
        echo "3. Cliquez sur 'Sauvegarder' ou 'Enregistrer'"
        echo ""
        read -p "Appuyez sur ENTRÉE après avoir fait le changement..."
    fi
else
    echo ""
    echo -e "${RED}❌ PROBLÈME: Enregistrements non trouvés${NC}"
    echo ""
    echo -e "${YELLOW}Solutions possibles:${NC}"
    echo "1. Vous pourriez être dans la mauvaise section"
    echo "2. Les enregistrements ont peut-être des noms différents"
    echo "3. Il faut peut-être créer les enregistrements"
    echo ""
    echo "Que voyez-vous dans la liste des enregistrements DNS ?"
    read -p "Décrivez ce que vous voyez: " dns_description
fi

echo ""
echo -e "${YELLOW}ÉTAPE 5: SAUVEGARDE FINALE${NC}"
echo "----------------------------"
echo "✅ Assurez-vous d'avoir cliqué sur 'Sauvegarder' ou 'Appliquer les changements'"
echo "✅ Cherchez un message de confirmation"
echo "✅ Parfois il faut attendre quelques secondes"
echo ""
read -p "Avez-vous vu un message de confirmation ? (o/n): " confirmation

if [[ $confirmation == "o" || $confirmation == "O" ]]; then
    echo ""
    echo -e "${GREEN}🎉 EXCELLENT !${NC}"
    echo "Les changements ont été sauvegardés."
    echo ""
    echo "Lançons une vérification immédiate:"
    echo ""
    
    # Vérification rapide
    echo -e "${BLUE}Vérification en cours...${NC}"
    sleep 2
    
    CURRENT_IP=$(dig +short @8.8.8.8 ges-cab.com A)
    echo "IP actuelle selon Google DNS: $CURRENT_IP"
    
    if [ "$CURRENT_IP" = "82.25.116.122" ]; then
        echo -e "${GREEN}🚀 SUCCÈS IMMÉDIAT ! Le changement est effectif !${NC}"
    else
        echo -e "${YELLOW}⏳ Propagation en cours... Vérification dans 5 minutes${NC}"
        echo "Ceci est normal, la propagation peut prendre jusqu'à 24h"
    fi
else
    echo ""
    echo -e "${RED}⚠️  ATTENTION:${NC}"
    echo "Sans confirmation, les changements ne sont peut-être pas sauvés."
    echo "Retournez dans l'interface et cherchez un bouton 'Sauvegarder' ou 'Appliquer'"
fi

echo ""
echo -e "${CYAN}📱 NEXT STEPS:${NC}"
echo "=============="
echo "1. Utilisez './check-dns-status.sh' pour surveiller la propagation"
echo "2. La propagation peut prendre de 5 minutes à 24 heures"
echo "3. Une fois propagé, nous activerons HTTPS avec './enable-https-complete.sh'"
echo ""
echo -e "${GREEN}🔧 Pour surveiller en temps réel:${NC}"
echo "./monitor-dns-propagation.sh"