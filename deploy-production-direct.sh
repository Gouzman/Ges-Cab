#!/bin/bash

# Script de déploiement automatisé - Ges-Cab Production
# Déploiement direct sur votre serveur 82.25.116.122

set -e

# Configuration pour votre serveur
ENV=${1:-production}
REMOTE_USER="root"
REMOTE_HOST="82.25.116.122"
REMOTE_PATH="/var/www/ges-cab"
BACKUP_PATH="/var/www/backups/ges-cab"
APP_PORT="3000"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_step() { echo -e "${BLUE}📋 $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${CYAN}ℹ️  $1${NC}"; }

echo "🚀 DÉPLOIEMENT GES-CAB PRODUCTION"
echo "Serveur: $REMOTE_HOST"
echo "=============================================="

# Vérifications préalables
print_step "Vérifications préalables..."

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ] || [ ! -f "vite.config.js" ]; then
    print_error "Ce script doit être exécuté depuis la racine du projet Ges-Cab"
    exit 1
fi

print_success "Répertoire de projet validé"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    print_step "Installation des dépendances..."
    npm install
    print_success "Dépendances installées"
fi

# Construire l'application
print_step "Construction de l'application..."
npm run build
print_success "Application construite"

# Test de connectivité au serveur
print_step "Test de connectivité au serveur..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes "$REMOTE_USER@$REMOTE_HOST" exit 2>/dev/null; then
    print_success "Connexion au serveur OK"
else
    print_error "Impossible de se connecter au serveur $REMOTE_HOST"
    print_info "Vérifiez que:"
    print_info "1. Votre clé SSH est configurée"
    print_info "2. Le serveur est accessible"
    print_info "3. L'utilisateur $REMOTE_USER existe"
    exit 1
fi

# Création des répertoires sur le serveur
print_step "Préparation des répertoires sur le serveur..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    mkdir -p $REMOTE_PATH
    mkdir -p $BACKUP_PATH
    mkdir -p /var/log/ges-cab
"
print_success "Répertoires préparés"

# Sauvegarde de la version actuelle
print_step "Sauvegarde de la version actuelle..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    if [ -d $REMOTE_PATH ] && [ \$(ls -A $REMOTE_PATH 2>/dev/null | wc -l) -gt 0 ]; then
        BACKUP_NAME=ges-cab-backup-\$(date +%Y%m%d-%H%M%S)
        cp -r $REMOTE_PATH $BACKUP_PATH/\$BACKUP_NAME
        echo 'Sauvegarde créée: \$BACKUP_NAME'
    else
        echo 'Aucune version précédente à sauvegarder'
    fi
"
print_success "Sauvegarde créée"

# Arrêt temporaire du service (si il existe)
print_step "Arrêt temporaire des services..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    pkill -f 'vite preview' || echo 'Aucun processus Vite à arrêter'
    pkill -f 'node.*3000' || echo 'Aucun processus Node sur port 3000 à arrêter'
    sleep 2
"
print_success "Services arrêtés"

# Déploiement des fichiers
print_step "Déploiement des fichiers de l'application..."
rsync -avz --delete \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.env*' \
    dist/ "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

print_success "Fichiers déployés"

# Déploiement des configurations Nginx
print_step "Déploiement des configurations Nginx..."
scp nginx-production-complete.conf "$REMOTE_USER@$REMOTE_HOST:/etc/nginx/sites-available/ges-cab"
scp fix-ges-cab-errors.sh "$REMOTE_USER@$REMOTE_HOST:/root/"
scp deploy-nginx-fix.sh "$REMOTE_USER@$REMOTE_HOST:/root/"
scp configure-dns.sh "$REMOTE_USER@$REMOTE_HOST:/root/"

ssh "$REMOTE_USER@$REMOTE_HOST" "
    chmod +x /root/fix-ges-cab-errors.sh
    chmod +x /root/deploy-nginx-fix.sh
    chmod +x /root/configure-dns.sh
    
    # Activer le site
    ln -sf /etc/nginx/sites-available/ges-cab /etc/nginx/sites-enabled/
    
    # Supprimer les anciens liens conflictuels
    rm -f /etc/nginx/sites-enabled/default
    rm -f /etc/nginx/sites-enabled/www.ges-cab.com
"
print_success "Configurations Nginx déployées"

# Test de la configuration Nginx
print_step "Test de la configuration Nginx..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    if nginx -t; then
        echo 'Configuration Nginx valide'
        systemctl reload nginx
        echo 'Nginx rechargé'
    else
        echo 'Configuration Nginx invalide!'
        exit 1
    fi
"
print_success "Nginx configuré et rechargé"

# Déploiement du code source et démarrage de l'application
print_step "Déploiement du code source et démarrage..."
rsync -avz --delete \
    --exclude='dist' \
    --exclude='node_modules' \
    --exclude='.git' \
    . "$REMOTE_USER@$REMOTE_HOST:/opt/ges-cab-source/"

ssh "$REMOTE_USER@$REMOTE_HOST" "
    cd /opt/ges-cab-source
    
    # Installer les dépendances
    npm install --production
    
    # Démarrer l'application
    nohup npm run preview > /var/log/ges-cab/app.log 2>&1 &
    
    sleep 5
    
    # Vérifier que l'application est démarrée
    if ss -tlnp | grep -q ':3000'; then
        echo 'Application démarrée sur le port 3000'
    else
        echo 'Erreur: Application non démarrée sur le port 3000'
        tail -n 20 /var/log/ges-cab/app.log
        exit 1
    fi
"
print_success "Application démarrée"

# Vérification des services
print_step "Vérification des services..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    echo '=== ÉTAT DES SERVICES ==='
    
    # Nginx
    if systemctl is-active --quiet nginx; then
        echo '✅ Nginx: Actif'
    else
        echo '❌ Nginx: Inactif'
    fi
    
    # Application sur port 3000
    if ss -tlnp | grep -q ':3000'; then
        echo '✅ Application (port 3000): Démarrée'
    else
        echo '❌ Application (port 3000): Non démarrée'
    fi
    
    # API sur port 8000 (optionnel)
    if ss -tlnp | grep -q ':8000'; then
        echo '✅ API (port 8000): Disponible'
    else
        echo '⚠️  API (port 8000): Non configurée (optionnel)'
    fi
    
    # Supabase Studio sur port 54323 (optionnel)
    if ss -tlnp | grep -q ':54323'; then
        echo '✅ Supabase Studio (port 54323): Démarré'
    else
        echo '⚠️  Supabase Studio (port 54323): Non démarré (optionnel)'
    fi
"
print_success "Vérification des services terminée"

# Test de santé de l'application
print_step "Test de santé de l'application..."
sleep 5

# Test local sur le serveur d'abord
ssh "$REMOTE_USER@$REMOTE_HOST" "
    if curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 | grep -q '200'; then
        echo 'Test local réussi: Application répond sur localhost:3000'
    else
        echo 'Attention: Application ne répond pas sur localhost:3000'
    fi
"

# Test externe
print_info "Test de https://ges-cab.com..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://ges-cab.com 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    print_success "✅ Site accessible - Code HTTP: $HTTP_CODE"
else
    print_warning "⚠️  Site retourne le code HTTP: $HTTP_CODE"
    print_info "Le site peut mettre quelques minutes à être complètement accessible"
fi

# Résumé du déploiement
echo ""
print_success "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!"
echo ""
print_info "📊 RÉSUMÉ:"
print_info "• Serveur: $REMOTE_HOST"
print_info "• Application: https://ges-cab.com"
print_info "• Logs: /var/log/ges-cab/app.log"
print_info "• Configuration: /etc/nginx/sites-available/ges-cab"
echo ""
print_info "🔧 COMMANDES UTILES SUR LE SERVEUR:"
print_info "• Voir les logs: tail -f /var/log/ges-cab/app.log"
print_info "• Redémarrer Nginx: systemctl restart nginx"
print_info "• Vérifier les services: ss -tlnp | grep -E ':(80|443|3000)'"
print_info "• Diagnostic complet: /root/fix-ges-cab-errors.sh"
echo ""
print_success "Déploiement de Ges-Cab terminé! 🚀"