#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 LANCEMENT RAPIDE DU DÉPLOIEMENT GES-CAB
# ═══════════════════════════════════════════════════════════════════════════════
# Configuration automatique pour votre serveur
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    🚀 DÉPLOIEMENT GES-CAB PRODUCTION                         ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}📋 Configuration détectée :${NC}"
echo "   • Domaine principal : ges-cab.com"
echo "   • API Supabase : api.ges-cab.com"
echo "   • Studio Admin : studio.ges-cab.com"
echo "   • Serveur VPS : 82.25.116.122"
echo ""

echo -e "${YELLOW}⚠️  Pré-requis à vérifier :${NC}"
echo "   1. DNS configuré (A records pointant vers 82.25.116.122)"
echo "   2. Accès SSH au serveur configuré"
echo "   3. Application Ges-Cab buildée localement"
echo ""

read -p "✅ Tous les pré-requis sont-ils OK ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Veuillez vérifier les pré-requis avant de continuer."
    echo ""
    echo "📋 Pour configurer les DNS :"
    echo "   • ges-cab.com → 82.25.116.122"
    echo "   • www.ges-cab.com → 82.25.116.122"
    echo "   • api.ges-cab.com → 82.25.116.122"
    echo "   • studio.ges-cab.com → 82.25.116.122"
    echo ""
    echo "🔐 Pour tester SSH :"
    echo "   ssh root@82.25.116.122"
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 Lancement du déploiement...${NC}"
echo ""

# Test de connexion SSH rapide
echo "🔍 Test de connexion SSH..."
echo "⚠️  Votre serveur nécessite une authentification par mot de passe."
echo "📝 Vous devrez saisir le mot de passe root plusieurs fois pendant le déploiement."
echo ""
read -p "🔐 Avez-vous le mot de passe root pour 82.25.116.122 ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Le mot de passe root est nécessaire pour continuer."
    echo "💡 Contactez votre hébergeur pour obtenir le mot de passe root."
    exit 1
fi

echo "🔍 Test de connexion avec mot de passe..."
if ssh -o ConnectTimeout=10 root@82.25.116.122 "echo 'SSH OK'" > /dev/null 2>&1; then
    echo "✅ Connexion SSH réussie"
else
    echo "❌ Échec de la connexion SSH"
    echo "Vérifiez :"
    echo "  • Que l'IP 82.25.116.122 est correcte"
    echo "  • Que le mot de passe root est correct"
    echo "  • Que le port SSH 22 est ouvert"
    exit 1
fi

# Lancement du script principal
echo ""
echo -e "${BLUE}🔄 Exécution du script de déploiement principal...${NC}"
echo ""

./scripts/deploy-production.sh ges-cab.com root@82.25.116.122

echo ""
echo -e "${GREEN}🎉 Déploiement terminé !${NC}"
echo ""
echo "🔗 Vos URLs :"
echo "   • Application : https://ges-cab.com"
echo "   • API : https://api.ges-cab.com"
echo "   • Admin : https://studio.ges-cab.com"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Attendez 2-3 minutes que tous les services démarrent"
echo "   2. Visitez https://ges-cab.com pour tester l'application"
echo "   3. Connectez-vous à https://studio.ges-cab.com pour l'admin"
echo ""