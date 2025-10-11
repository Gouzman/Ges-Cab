#!/bin/bash

echo "🚨 DIAGNOSTIC URGENT - PROBLÈME DE CONNEXION"
echo "============================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${RED}❌ ERREUR DÉTECTÉE: ERR_CONNECTION_RESET${NC}"
echo "Cette erreur indique que le serveur ne répond plus ou qu'un service s'est arrêté."
echo ""

echo -e "${BLUE}🔍 DIAGNOSTIC EN COURS...${NC}"
echo "=========================="
echo ""

echo -e "${YELLOW}1. TEST DE CONNECTIVITÉ SERVEUR${NC}"
echo "--------------------------------"
echo "Test ping du serveur..."
ping -c 3 82.25.116.122

echo ""
echo -e "${YELLOW}2. VÉRIFICATION DNS${NC}"
echo "-------------------"
echo "Résolution DNS de ges-cab.com..."
nslookup ges-cab.com
echo ""

echo -e "${YELLOW}3. TEST DES PORTS${NC}"
echo "------------------"
echo "Test port 80 (HTTP)..."
nc -zv 82.25.116.122 80 2>&1 || echo "❌ Port 80 fermé"
echo ""
echo "Test port 443 (HTTPS)..."
nc -zv 82.25.116.122 443 2>&1 || echo "❌ Port 443 fermé"
echo ""
echo "Test port 22 (SSH)..."
nc -zv 82.25.116.122 22 2>&1 || echo "❌ Port 22 fermé"
echo ""

echo -e "${YELLOW}4. TEST HTTP/HTTPS${NC}"
echo "-------------------"
echo "Test HTTP direct..."
curl -I http://82.25.116.122 2>&1 | head -5 || echo "❌ HTTP ne répond pas"
echo ""
echo "Test HTTPS direct..."
curl -I https://82.25.116.122 2>&1 | head -5 || echo "❌ HTTPS ne répond pas"
echo ""
echo "Test domaine HTTP..."
curl -I http://ges-cab.com 2>&1 | head -5 || echo "❌ Domaine HTTP ne répond pas"
echo ""
echo "Test domaine HTTPS..."
curl -I https://ges-cab.com 2>&1 | head -5 || echo "❌ Domaine HTTPS ne répond pas"
echo ""

echo -e "${CYAN}💡 ACTIONS CORRECTIVES POSSIBLES :${NC}"
echo "=================================="
echo ""

# Tester la connectivité SSH
echo -e "${BLUE}🔧 TENTATIVE DE CONNEXION SSH...${NC}"
echo "Tentative de connexion SSH pour diagnostiquer..."

ssh -o ConnectTimeout=10 -o BatchMode=yes root@82.25.116.122 "echo 'SSH OK'" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSH fonctionne - Le serveur est accessible${NC}"
    echo ""
    echo -e "${YELLOW}🔧 COMMANDES DE DIAGNOSTIC SUR LE SERVEUR :${NC}"
    echo "=========================================="
    echo ""
    echo "Connectez-vous en SSH et exécutez :"
    echo "ssh root@82.25.116.122"
    echo ""
    echo "Puis vérifiez :"
    echo "# État des services"
    echo "systemctl status nginx"
    echo "systemctl status docker"
    echo ""
    echo "# Processus en cours"
    echo "ps aux | grep nginx"
    echo "docker ps | grep supabase"
    echo ""
    echo "# Logs d'erreur"
    echo "tail -f /var/log/nginx/error.log"
    echo "journalctl -u nginx -f"
    echo ""
    echo "# Redémarrage si nécessaire"
    echo "systemctl restart nginx"
    echo "cd /root/supabase && docker-compose restart"
else
    echo -e "${RED}❌ SSH ne répond pas - Problème serveur critique${NC}"
    echo ""
    echo -e "${YELLOW}🚨 ACTIONS D'URGENCE :${NC}"
    echo "====================="
    echo ""
    echo "1. 🔄 Redémarrer le serveur via votre panel OVH/VPS"
    echo "2. ☎️  Contacter le support de votre hébergeur"
    echo "3. 🔍 Vérifier les logs d'activité du serveur"
    echo "4. 💾 Vérifier si le serveur a suffisamment d'espace disque"
    echo ""
fi

echo -e "${BLUE}📊 STATUT RÉSUMÉ :${NC}"
echo "=================="
echo ""
echo "Date d'expiration SSL : Friday, January 9, 2026 at 7:30:07 AM"
echo "❌ Problème actuel : ERR_CONNECTION_RESET"
echo ""

echo -e "${YELLOW}🔧 SCRIPTS DE RÉCUPÉRATION :${NC}"
echo "============================"
echo ""
echo "Si vous avez accès SSH :"
echo "./scripts/restart-all-services.sh"
echo ""
echo "Pour monitoring continu :"
echo "./scripts/monitor-server-health.sh"
echo ""

echo -e "${GREEN}📞 BESOIN D'AIDE IMMÉDIATE ?${NC}"
echo "============================="
echo ""
echo "1. Essayez de vous connecter en SSH : ssh root@82.25.116.122"
echo "2. Si SSH fonctionne, redémarrez nginx : systemctl restart nginx"
echo "3. Vérifiez les conteneurs Docker : docker ps"
echo "4. Si rien ne fonctionne, redémarrez le serveur complet"
echo ""

echo -e "${CYAN}💡 PRÉVENTION FUTURE :${NC}"
echo "====================="
echo "Après résolution, configurons :"
echo "- Monitoring automatique 24/7"
echo "- Alertes par email en cas de panne"
echo "- Redémarrage automatique des services"
echo "- Backup automatique quotidien"