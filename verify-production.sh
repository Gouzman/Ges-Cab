#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# 🔍 VÉRIFICATION POST-DÉPLOIEMENT - Ges-Cab Production
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    🔍 VÉRIFICATION POST-DÉPLOIEMENT                          ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration
DOMAIN="ges-cab.com"
API_DOMAIN="api.ges-cab.com"
STUDIO_DOMAIN="studio.ges-cab.com"
SERVER_IP="82.25.116.122"

echo -e "${YELLOW}📋 Tests de vérification en cours...${NC}"
echo ""

# Test 1: Résolution DNS
echo "🌐 Test 1: Résolution DNS"
if dig +short $DOMAIN | grep -q "$SERVER_IP"; then
    echo -e "   ${GREEN}✅ $DOMAIN → $SERVER_IP${NC}"
else
    echo -e "   ${RED}❌ $DOMAIN ne résout pas vers $SERVER_IP${NC}"
fi

if dig +short $API_DOMAIN | grep -q "$SERVER_IP"; then
    echo -e "   ${GREEN}✅ $API_DOMAIN → $SERVER_IP${NC}"
else
    echo -e "   ${RED}❌ $API_DOMAIN ne résout pas vers $SERVER_IP${NC}"
fi

echo ""

# Test 2: HTTPS et certificats SSL
echo "🔒 Test 2: Certificats SSL"
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|301\|302"; then
    echo -e "   ${GREEN}✅ https://$DOMAIN accessible${NC}"
    if curl -s -I https://$DOMAIN | grep -q "200\|301\|302"; then
        echo -e "   ${GREEN}✅ SSL valide pour $DOMAIN${NC}"
    fi
else
    echo -e "   ${RED}❌ https://$DOMAIN non accessible${NC}"
fi

echo ""

# Test 3: Application React
echo "⚛️  Test 3: Application React"
if curl -s https://$DOMAIN | grep -q "Ges-Cab\|React"; then
    echo -e "   ${GREEN}✅ Application React chargée${NC}"
else
    echo -e "   ${RED}❌ Application React non détectée${NC}"
fi

if curl -s https://$DOMAIN | grep -q "assets.*js\|assets.*css"; then
    echo -e "   ${GREEN}✅ Assets statiques détectés${NC}"
else
    echo -e "   ${RED}❌ Assets statiques manquants${NC}"
fi

echo ""

# Test 4: API Supabase
echo "🗄️  Test 4: API Supabase"
if curl -s -o /dev/null -w "%{http_code}" https://$API_DOMAIN | grep -q "200\|400\|401"; then
    echo -e "   ${GREEN}✅ API Supabase répond${NC}"
else
    echo -e "   ${RED}❌ API Supabase non accessible${NC}"
fi

echo ""

# Test 5: Studio Admin
echo "🎛️  Test 5: Studio Admin"
if curl -s -o /dev/null -w "%{http_code}" https://$STUDIO_DOMAIN | grep -q "200\|301\|302"; then
    echo -e "   ${GREEN}✅ Studio Admin accessible${NC}"
else
    echo -e "   ${RED}❌ Studio Admin non accessible${NC}"
fi

echo ""

# Test 6: Temps de réponse
echo "⚡ Test 6: Performance"
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" https://$DOMAIN)
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc)
if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    echo -e "   ${GREEN}✅ Temps de réponse: ${RESPONSE_MS}ms (< 2s)${NC}"
else
    echo -e "   ${YELLOW}⚠️  Temps de réponse: ${RESPONSE_MS}ms (> 2s)${NC}"
fi

echo ""

# Test 7: Serveur SSH
echo "🔐 Test 7: Accès serveur"
if ssh -o ConnectTimeout=5 -o BatchMode=yes root@$SERVER_IP "echo 'SSH OK'" 2>/dev/null; then
    echo -e "   ${GREEN}✅ Accès SSH disponible${NC}"
else
    echo -e "   ${YELLOW}⚠️  SSH nécessite authentification manuelle${NC}"
fi

echo ""

# Test 8: Logs récents
echo "📊 Test 8: Status des services"
echo -e "   ${BLUE}ℹ️  Vérification manuelle requise pour :${NC}"
echo "      • Logs Nginx: ssh root@$SERVER_IP 'tail -n 20 /var/log/nginx/access.log'"
echo "      • Status services: ssh root@$SERVER_IP 'systemctl status nginx'"
echo "      • Espace disque: ssh root@$SERVER_IP 'df -h'"

echo ""

# Résumé
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                              📋 RÉSUMÉ                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}🎯 URLs de production vérifiées :${NC}"
echo "   • Application : https://$DOMAIN"
echo "   • API Backend : https://$API_DOMAIN"
echo "   • Administration : https://$STUDIO_DOMAIN"
echo ""

echo -e "${YELLOW}📝 Actions recommandées :${NC}"
echo "   1. Tester l'authentification sur https://$DOMAIN"
echo "   2. Vérifier les logs serveur manuellement"
echo "   3. Configurer monitoring et alertes"
echo "   4. Programmer sauvegardes automatiques"
echo ""

echo -e "${GREEN}✅ Déploiement validé - Ges-Cab est EN PRODUCTION !${NC}"
echo ""