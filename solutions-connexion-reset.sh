#!/bin/bash

echo "🔧 SOLUTIONS POUR ERR_CONNECTION_RESET"
echo "======================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 SOLUTIONS PAR ORDRE DE PRIORITÉ :${NC}"
echo "===================================="
echo ""

echo -e "${GREEN}SOLUTION 1: NETTOYAGE CACHE NAVIGATEUR${NC}"
echo "========================================"
echo ""
echo "Dans votre navigateur :"
echo "1. 🔄 Actualisation forcée : Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)"
echo "2. 🧹 Vider le cache :"
echo "   - Chrome : Settings → Privacy and security → Clear browsing data"
echo "   - Firefox : Settings → Privacy & Security → Clear Data"
echo "   - Safari : Develop → Empty Caches"
echo "3. 🌐 Essayer en navigation privée/incognito"
echo ""

echo -e "${GREEN}SOLUTION 2: TEST DIRECT${NC}"
echo "========================"
echo ""
echo "Testez directement ces URLs :"
echo "🔗 http://82.25.116.122 (fonctionne selon notre test)"
echo "🔗 https://ges-cab.com (fonctionne selon notre test)"
echo ""

echo -e "${GREEN}SOLUTION 3: REDÉMARRAGE NGINX À DISTANCE${NC}"
echo "============================================="
echo ""
echo "Si vous avez un accès alternatif au serveur :"
echo ""

# Créer un script de redémarrage via API
cat > restart-services-api.sh << 'EOF'
#!/bin/bash

echo "🔄 TENTATIVE DE REDÉMARRAGE VIA API"
echo "==================================="

# Si vous avez configuré une API de monitoring
echo "Test de l'API de santé..."
curl -f https://ges-cab.com/health 2>/dev/null && echo "✅ API répond" || echo "❌ API ne répond pas"

# Alternative : utiliser un service de monitoring externe
echo ""
echo "💡 Alternatives :"
echo "1. Panel d'administration de votre hébergeur"
echo "2. Console web de votre VPS"
echo "3. Redémarrage depuis l'interface de gestion"
EOF

chmod +x restart-services-api.sh

echo "Script créé : ./restart-services-api.sh"
echo ""

echo -e "${GREEN}SOLUTION 4: VÉRIFICATION DEPUIS UN AUTRE RÉSEAU${NC}"
echo "==============================================="
echo ""
echo "Testez depuis :"
echo "📱 Votre téléphone (4G/5G)"
echo "🌐 Un autre réseau WiFi"
echo "🔗 https://downforeveryoneorjustme.com/ges-cab.com"
echo ""

echo -e "${GREEN}SOLUTION 5: ACCÈS D'URGENCE AU SERVEUR${NC}"
echo "=========================================="
echo ""
echo "Si vous avez accès au panel de votre hébergeur :"
echo ""
echo "1. 🖥️  Console web / VNC"
echo "2. 🔄 Redémarrage du serveur"
echo "3. 📊 Vérification des ressources (CPU, RAM, disque)"
echo "4. 📝 Consultation des logs système"
echo ""

echo -e "${YELLOW}🔧 SCRIPTS DE RÉCUPÉRATION CRÉÉS :${NC}"
echo "=================================="
echo ""

# Script de monitoring continu
cat > monitor-site-recovery.sh << 'EOF'
#!/bin/bash

echo "📊 MONITORING CONTINU DE RÉCUPÉRATION"
echo "====================================="

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Test HTTPS
    if curl -f -s https://ges-cab.com > /dev/null 2>&1; then
        echo "[$TIMESTAMP] ✅ Site accessible"
        break
    else
        echo "[$TIMESTAMP] ❌ Site inaccessible - Retry dans 30s..."
        sleep 30
    fi
done

echo "🎉 SITE RÉCUPÉRÉ ! Lancement de tests complets..."

# Tests complets après récupération
curl -I https://ges-cab.com
echo ""
echo "🚀 Le site est de nouveau fonctionnel !"
EOF

chmod +x monitor-site-recovery.sh

echo "✅ ./restart-services-api.sh"
echo "✅ ./monitor-site-recovery.sh"
echo ""

echo -e "${CYAN}🎯 PLAN D'ACTION RECOMMANDÉ :${NC}"
echo "================================"
echo ""
echo "1. 🧹 Videz votre cache navigateur"
echo "2. 🌐 Testez en navigation privée"
echo "3. 📱 Testez depuis votre téléphone"
echo "4. 🔄 Si ça ne marche pas : redémarrez le serveur via votre panel"
echo "5. 📊 Lancez le monitoring : ./monitor-site-recovery.sh"
echo ""

echo -e "${GREEN}📈 MONITORING EN TEMPS RÉEL :${NC}"
echo "============================"
echo ""
echo "Pour surveiller la récupération :"
echo "./monitor-site-recovery.sh"
echo ""

echo -e "${BLUE}💡 TRÈS IMPORTANT :${NC}"
echo "=================="
echo ""
echo "Le diagnostic montre que le serveur fonctionne globalement."
echo "L'erreur ERR_CONNECTION_RESET est souvent temporaire."
echo "Dans 90% des cas, vider le cache du navigateur résout le problème."
echo ""

echo -e "${YELLOW}📞 SI LE PROBLÈME PERSISTE :${NC}"
echo "============================="
echo ""
echo "1. Contactez-moi avec le résultat de ces tests"
echo "2. Indiquez votre navigateur et système d'exploitation"
echo "3. Précisez si l'erreur survient sur toutes les pages"
echo "4. Mentionnez si d'autres personnes ont le même problème"