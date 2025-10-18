#!/bin/bash

# 🔍 Script de Diagnostic CORS pour Supabase
# Ce script vérifie la configuration CORS pour les API Supabase

set -e

# Couleurs pour une meilleure lisibilité
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 DIAGNOSTIC CORS SUPABASE${NC}"
echo "============================="
echo ""

VPS_IP="82.25.116.122"
SSH_USER="admin"
API_DOMAIN="api.ges-cab.com"
STUDIO_DOMAIN="studio.ges-cab.com"
LOCAL_DEV_URL="http://localhost:3001"

# Vérifier les domaines avec curl
echo -e "${YELLOW}🌐 Vérification de la configuration CORS...${NC}"

echo -e "\n${BLUE}1. Test de l'API Supabase avec OPTIONS (preflight)${NC}"
CORS_TEST_API=$(curl -s -I -X OPTIONS \
  -H "Origin: ${LOCAL_DEV_URL}" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization, apikey" \
  "https://${API_DOMAIN}/rest/v1/profiles" | grep -i "access-control-allow")

if [ -z "$CORS_TEST_API" ]; then
  echo -e "${RED}❌ Aucun en-tête CORS trouvé dans la réponse API.${NC}"
  echo "Une configuration CORS est nécessaire. Exécutez fix-cors-supabase.sh"
else
  echo -e "${GREEN}✅ En-têtes CORS détectés dans l'API :${NC}"
  echo "$CORS_TEST_API"
fi

echo -e "\n${BLUE}2. Test du Studio Supabase avec OPTIONS${NC}"
CORS_TEST_STUDIO=$(curl -s -I -X OPTIONS \
  -H "Origin: ${LOCAL_DEV_URL}" \
  -H "Access-Control-Request-Method: GET" \
  "https://${STUDIO_DOMAIN}/" | grep -i "access-control-allow")

if [ -z "$CORS_TEST_STUDIO" ]; then
  echo -e "${YELLOW}⚠️ Aucun en-tête CORS trouvé dans la réponse Studio.${NC}"
  echo "Le Studio peut nécessiter une configuration séparée."
else
  echo -e "${GREEN}✅ En-têtes CORS détectés dans Studio :${NC}"
  echo "$CORS_TEST_STUDIO"
fi

echo -e "\n${BLUE}3. Vérification de la configuration Nginx sur le serveur${NC}"
echo -e "${YELLOW}Connexion au serveur pour vérifier la configuration...${NC}"

if ! ssh -q ${SSH_USER}@${VPS_IP} exit; then
  echo -e "${RED}❌ Impossible de se connecter au serveur via SSH.${NC}"
else
  echo -e "${GREEN}✅ Connexion SSH réussie.${NC}"
  
  # Vérifier la configuration des virtualhost Nginx
  API_CONFIG=$(ssh ${SSH_USER}@${VPS_IP} "sudo cat /etc/nginx/sites-available/${API_DOMAIN}.conf 2>/dev/null || echo 'Configuration non trouvée'")
  
  if echo "$API_CONFIG" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ Configuration CORS trouvée dans le virtualhost API.${NC}"
    echo -e "${BLUE}Directives CORS détectées :${NC}"
    echo "$API_CONFIG" | grep -i "access-control" | sed 's/^/    /'
  else
    echo -e "${RED}❌ Aucune configuration CORS trouvée dans le virtualhost API.${NC}"
    echo -e "Exécutez fix-cors-supabase.sh pour ajouter les en-têtes CORS nécessaires."
  fi
  
  # Vérifier si cors-config.conf existe
  CORS_CONFIG=$(ssh ${SSH_USER}@${VPS_IP} "sudo cat /etc/nginx/cors-config.conf 2>/dev/null || echo 'Non trouvé'")
  
  if [ "$CORS_CONFIG" != "Non trouvé" ]; then
    echo -e "${GREEN}✅ Fichier de configuration CORS global trouvé.${NC}"
  else
    echo -e "${YELLOW}⚠️ Pas de fichier de configuration CORS global.${NC}"
  fi
fi

echo -e "\n${BLUE}4. Test de requête API réelle${NC}"
API_TEST=$(curl -s -X GET \
  -H "Origin: ${LOCAL_DEV_URL}" \
  -H "apikey: $ANON_KEY" \
  -w "\nHTTP_CODE: %{http_code}\n" \
  "https://${API_DOMAIN}/rest/v1/profiles?limit=1" || echo "Erreur de requête")

HTTP_CODE=$(echo "$API_TEST" | grep "HTTP_CODE" | cut -d' ' -f2)
CORS_HEADERS=$(echo "$API_TEST" | grep -i "Access-Control")

echo -e "Code HTTP: ${YELLOW}${HTTP_CODE}${NC}"
if [ -n "$CORS_HEADERS" ]; then
  echo -e "${GREEN}✅ En-têtes CORS dans la réponse réelle :${NC}"
  echo "$CORS_HEADERS"
else
  echo -e "${RED}❌ Aucun en-tête CORS dans la réponse réelle.${NC}"
fi

echo ""
echo -e "${BLUE}📋 DIAGNOSTIC COMPLET${NC}"
echo "======================"

if echo "$API_CONFIG" | grep -q "Access-Control-Allow-Origin" && [ -n "$CORS_TEST_API" ]; then
  echo -e "${GREEN}✅ La configuration CORS semble correcte.${NC}"
  echo ""
  echo -e "${YELLOW}Pour tester dans l'application :${NC}"
  echo "1. Accédez à http://localhost:3001/?diagnostic=cors"
  echo "2. Vérifiez que les tests CORS passent"
else
  echo -e "${RED}❌ Problème détecté avec la configuration CORS.${NC}"
  echo ""
  echo -e "${YELLOW}Solution recommandée :${NC}"
  echo "1. Exécutez ./fix-cors-supabase.sh"
  echo "2. Redémarrez l'application : npm run dev"
  echo "3. Vérifiez à nouveau avec ce diagnostic"
fi