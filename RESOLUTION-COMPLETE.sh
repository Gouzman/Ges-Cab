#!/bin/bash
# GUIDE COMPLET - Résolution des erreurs 404/502 sur Ges-Cab
# Exécutez ce script sur votre serveur pour corriger tous les problèmes

echo "🚀 RÉSOLUTION COMPLÈTE DES ERREURS GES-CAB"
echo "=========================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}📋 PROBLÈMES IDENTIFIÉS :${NC}"
echo -e "• 404 sur ges-cab.com → Service principal non démarré"
echo -e "• 404 sur studio.ges-cab.com → Supabase Studio manquant"
echo -e "• 502 sur api.ges-cab.com → API non accessible"

echo -e "\n${GREEN}🔧 PLAN DE CORRECTION :${NC}"
echo -e "1. Corriger les certificats SSL"
echo -e "2. Configurer le DNS des sous-domaines"
echo -e "3. Déployer la configuration Nginx corrigée"
echo -e "4. Démarrer tous les services requis"
echo -e "5. Tester et valider"

echo -e "\n${CYAN}📝 COMMANDES À EXÉCUTER SUR LE SERVEUR :${NC}"

cat << 'EOF'

# ================================
# ÉTAPE 1: Préparation
# ================================

# Copier tous les fichiers sur le serveur
scp nginx-production-complete.conf root@votre-serveur:/root/
scp fix-ges-cab-errors.sh root@votre-serveur:/root/
scp configure-dns.sh root@votre-serveur:/root/
scp deploy-nginx-fix.sh root@votre-serveur:/root/
scp start-production.sh root@votre-serveur:/root/

# ================================
# ÉTAPE 2: Connexion au serveur
# ================================

ssh root@votre-serveur

# ================================
# ÉTAPE 3: Configuration DNS (OBLIGATOIRE)
# ================================

# Exécuter le guide DNS
./configure-dns.sh

# IMPORTANT: Ajoutez ces enregistrements DNS chez votre fournisseur :
# Type A : studio.ges-cab.com → IP_SERVEUR
# Type A : api.ges-cab.com → IP_SERVEUR

# ================================
# ÉTAPE 4: Certificats SSL
# ================================

# Étendre le certificat pour inclure les sous-domaines
certbot --nginx -d studio.ges-cab.com -d api.ges-cab.com --expand

# Ou créer un nouveau certificat complet
certbot certonly --standalone \
  -d ges-cab.com \
  -d www.ges-cab.com \
  -d studio.ges-cab.com \
  -d api.ges-cab.com \
  --expand

# ================================
# ÉTAPE 5: Déploiement Nginx
# ================================

# Déployer la configuration Nginx corrigée
./deploy-nginx-fix.sh

# ================================
# ÉTAPE 6: Démarrage des services
# ================================

# Diagnostic et correction automatique
./fix-ges-cab-errors.sh

# OU démarrage manuel :

# 6a. Démarrer l'application React/Vite (port 3000)
cd /path/to/your/ges-cab-app
npm install
npm run build
nohup npm run preview &

# 6b. Démarrer Supabase Studio (port 54323)
cd /path/to/your/ges-cab-app
supabase start

# 6c. Démarrer une API simple (port 8000)
cat > /tmp/api.js << 'EOFAPI'
const http = require('http');
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    res.writeHead(200);
    res.end(JSON.stringify({status: 'ok', message: 'API Ges-Cab'}));
});
server.listen(8000, '127.0.0.1');
EOFAPI

nohup node /tmp/api.js &

# ================================
# ÉTAPE 7: Vérification
# ================================

# Tester les services
ss -tlnp | grep -E ":(80|443|3000|8000|54323) "

# Tester Nginx
nginx -t
systemctl restart nginx

# Tester les domaines
curl -I https://ges-cab.com
curl -I https://studio.ges-cab.com
curl -I https://api.ges-cab.com

# ================================
# ÉTAPE 8: Monitoring
# ================================

# Surveiller les logs en temps réel
tail -f /var/log/nginx/ges-cab.error.log

# Vérifier les processus
ps aux | grep -E "(vite|node|supabase)"

EOF

echo -e "\n${YELLOW}⚠️  POINTS CRITIQUES :${NC}"
echo -e "1. ${RED}DNS OBLIGATOIRE${NC} : Configurez les enregistrements DNS pour studio.ges-cab.com et api.ges-cab.com"
echo -e "2. ${RED}CERTIFICATS SSL${NC} : Étendez ou recréez les certificats pour couvrir les sous-domaines"
echo -e "3. ${RED}SERVICES${NC} : Assurez-vous que les services tournent sur les bons ports"

echo -e "\n${BLUE}🔍 VÉRIFICATION RAPIDE :${NC}"
echo -e "• Port 3000 : ${CYAN}ss -tlnp | grep :3000${NC}"
echo -e "• Port 8000 : ${CYAN}ss -tlnp | grep :8000${NC}"
echo -e "• Port 54323 : ${CYAN}ss -tlnp | grep :54323${NC}"
echo -e "• Certificats : ${CYAN}certbot certificates${NC}"
echo -e "• DNS : ${CYAN}dig studio.ges-cab.com${NC}"

echo -e "\n${GREEN}📞 SUPPORT :${NC}"
echo -e "Si vous rencontrez des difficultés :"
echo -e "1. Vérifiez les logs : ${CYAN}tail -f /var/log/nginx/error.log${NC}"
echo -e "2. Testez la config : ${CYAN}nginx -t${NC}"
echo -e "3. Redémarrez : ${CYAN}systemctl restart nginx${NC}"

echo -e "\n${GREEN}🎯 OBJECTIF FINAL :${NC}"
echo -e "✅ https://ges-cab.com → Application React/Vite"
echo -e "✅ https://studio.ges-cab.com → Supabase Studio"
echo -e "✅ https://api.ges-cab.com → API REST"
echo -e "✅ Tous les certificats SSL valides"
echo -e "✅ Aucune erreur 404 ou 502"

echo -e "\n${CYAN}📋 CHECKLIST POST-DÉPLOIEMENT :${NC}"
cat << 'CHECKLIST'
[ ] DNS configuré pour tous les sous-domaines
[ ] Certificats SSL étendus ou recréés
[ ] Configuration Nginx déployée
[ ] Service sur port 3000 démarré
[ ] Service sur port 8000 démarré  
[ ] Service sur port 54323 démarré
[ ] Nginx redémarré sans erreur
[ ] Tests des 3 domaines réussis
[ ] Logs sans erreur critique
[ ] Performance acceptable
CHECKLIST

echo -e "\n${GREEN}🚀 Prêt pour le déploiement ! Suivez les étapes ci-dessus.${NC}"