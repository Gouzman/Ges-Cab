#!/bin/bash

echo "🔬 DIAGNOSTIC DNS APPROFONDI - ges-cab.com"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. SERVEURS DNS AUTORITAIRES${NC}"
echo "----------------------------"
dig +short NS ges-cab.com
echo ""

echo -e "${BLUE}2. ENREGISTREMENTS A ACTUELS${NC}"
echo "----------------------------"
echo "✅ Depuis serveurs DNS racine (publics):"
dig +short @8.8.8.8 ges-cab.com A
dig +short @1.1.1.1 ges-cab.com A
echo ""

echo "✅ Depuis serveurs DNS Hostinger:"
HOSTINGER_NS=$(dig +short NS ges-cab.com | head -1)
if [ ! -z "$HOSTINGER_NS" ]; then
    echo "Serveur DNS: $HOSTINGER_NS"
    dig +short @$HOSTINGER_NS ges-cab.com A
else
    echo "❌ Impossible de trouver les serveurs NS"
fi
echo ""

echo -e "${BLUE}3. CACHE DNS LOCAL${NC}"
echo "-------------------"
echo "Votre ordinateur voit:"
nslookup ges-cab.com
echo ""

echo -e "${BLUE}4. VÉRIFICATION WHOIS${NC}"
echo "---------------------"
whois ges-cab.com | grep -E "(Name Server|Registry|Registrar)" | head -10
echo ""

echo -e "${BLUE}5. TEST DEPUIS DIFFÉRENTS SERVEURS DNS${NC}"
echo "--------------------------------------------"
echo "Google DNS (8.8.8.8):"
dig +short @8.8.8.8 ges-cab.com A
echo ""
echo "Cloudflare DNS (1.1.1.1):"
dig +short @1.1.1.1 ges-cab.com A
echo ""
echo "OpenDNS (208.67.222.222):"
dig +short @208.67.222.222 ges-cab.com A
echo ""

echo -e "${BLUE}6. HISTORIQUE TTL${NC}"
echo "------------------"
dig ges-cab.com A | grep -E "(ges-cab.com|IN A)" | head -5
echo ""

echo -e "${YELLOW}📝 ANALYSE:${NC}"
echo "============"

# Vérifier si tous les serveurs donnent la même réponse
GOOGLE_IP=$(dig +short @8.8.8.8 ges-cab.com A)
CLOUDFLARE_IP=$(dig +short @1.1.1.1 ges-cab.com A)
OPENDNS_IP=$(dig +short @208.67.222.222 ges-cab.com A)

echo "Google DNS: $GOOGLE_IP"
echo "Cloudflare DNS: $CLOUDFLARE_IP"
echo "OpenDNS: $OPENDNS_IP"
echo ""

if [ "$GOOGLE_IP" = "82.25.116.122" ] && [ "$CLOUDFLARE_IP" = "82.25.116.122" ] && [ "$OPENDNS_IP" = "82.25.116.122" ]; then
    echo -e "${GREEN}✅ SUCCÈS: Tous les serveurs DNS publics voient la nouvelle IP !${NC}"
    echo "Le changement a bien été effectué, c'est juste une question de propagation."
elif [ "$GOOGLE_IP" = "84.32.84.32" ] && [ "$CLOUDFLARE_IP" = "84.32.84.32" ] && [ "$OPENDNS_IP" = "84.32.84.32" ]; then
    echo -e "${RED}❌ PROBLÈME: Tous les serveurs voient encore l'ancienne IP${NC}"
    echo "Le changement n'a pas été effectué correctement dans Hostinger."
else
    echo -e "${YELLOW}⚠️  PROPAGATION EN COURS: Réponses mixtes${NC}"
    echo "Certains serveurs ont la nouvelle IP, d'autres l'ancienne."
fi

echo ""
echo -e "${BLUE}💡 RECOMMANDATIONS:${NC}"
echo "==================="

if [ "$GOOGLE_IP" = "84.32.84.32" ]; then
    echo -e "${RED}🔄 Il faut revérifier la configuration Hostinger:${NC}"
    echo ""
    echo "1. Aller sur: https://hpanel.hostinger.com/"
    echo "2. Domaines → ges-cab.com"
    echo "3. DNS Zone Editor"
    echo "4. Chercher l'enregistrement A avec le nom '@' ou 'ges-cab.com'"
    echo "5. Vérifier que l'IP est bien 82.25.116.122"
    echo "6. Chercher AUSSI l'enregistrement A avec le nom 'www'"
    echo "7. Vérifier que l'IP est bien 82.25.116.122"
    echo ""
    echo -e "${YELLOW}⚠️  Points à vérifier:${NC}"
    echo "- Avez-vous bien SAUVEGARDÉ les changements ?"
    echo "- Y a-t-il plusieurs enregistrements A pour le même domaine ?"
    echo "- Avez-vous modifié le bon domaine (ges-cab.com) ?"
    echo "- Êtes-vous connecté au bon compte Hostinger ?"
else
    echo -e "${GREEN}✅ Configuration correcte, attendez la propagation (24-48h max)${NC}"
fi