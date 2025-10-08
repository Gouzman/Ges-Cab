#!/bin/bash

# Script de déploiement automatisé - Ges-Cab
# Usage: ./scripts/deploy.sh [staging|production]

set -e

# Configuration
ENV=${1:-production}
REMOTE_USER="votre_utilisateur"
REMOTE_HOST="votre_serveur.com"
REMOTE_PATH="/var/www/ges-cab"
BACKUP_PATH="/var/www/backups/ges-cab"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() { echo -e "${BLUE}📋 $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

echo "🚀 DÉPLOIEMENT GES-CAB - Environnement: $ENV"
echo "=============================================="

# Vérifications préalables
print_step "Vérifications préalables..."

if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
    print_error "Environnement invalide. Utilisez 'staging' ou 'production'"
    exit 1
fi

if [ ! -f ".env.local" ]; then
    print_error "Fichier .env.local manquant"
    exit 1
fi

if [ ! -d "dist" ]; then
    print_error "Dossier dist manquant. Exécutez 'npm run build' d'abord"
    exit 1
fi

print_success "Vérifications OK"

# Test de connectivité au serveur
print_step "Test de connectivité au serveur..."
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 $REMOTE_USER@$REMOTE_HOST exit; then
    print_error "Impossible de se connecter au serveur $REMOTE_HOST"
    print_warning "Vérifiez votre configuration SSH et vos clés"
    exit 1
fi
print_success "Connexion serveur OK"

# Sauvegarde de l'ancienne version
print_step "Sauvegarde de l'ancienne version..."
ssh $REMOTE_USER@$REMOTE_HOST "
    if [ -d '$REMOTE_PATH' ]; then
        sudo mkdir -p $BACKUP_PATH
        sudo cp -r $REMOTE_PATH $BACKUP_PATH/backup-\$(date +%Y%m%d-%H%M%S)
        echo 'Sauvegarde créée'
    fi
"
print_success "Sauvegarde terminée"

# Upload des fichiers
print_step "Upload des fichiers..."
rsync -avz --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.env*' \
    --exclude='*.log' \
    dist/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

print_success "Fichiers uploadés"

# Configuration du serveur web
print_step "Configuration du serveur web..."
ssh $REMOTE_USER@$REMOTE_HOST "
    # Configuration Nginx pour SPA
    sudo tee /etc/nginx/sites-available/ges-cab > /dev/null << 'EOF'
server {
    listen 80;
    server_name $REMOTE_HOST;
    root $REMOTE_PATH;
    index index.html;

    # Compression gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Headers de sécurité
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header Referrer-Policy \"no-referrer-when-downgrade\" always;
    add_header Content-Security-Policy \"default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';\" always;

    # Cache des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }

    # SPA routing - toutes les routes vers index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Fichiers de configuration
    location ~ /\. {
        deny all;
    }
}
EOF

    # Activer le site
    sudo ln -sf /etc/nginx/sites-available/ges-cab /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
"

print_success "Configuration serveur web terminée"

# Test du déploiement
print_step "Test du déploiement..."
if curl -f http://$REMOTE_HOST > /dev/null 2>&1; then
    print_success "Application accessible"
else
    print_warning "Application peut ne pas être accessible immédiatement"
fi

# Instructions post-déploiement
echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ!"
echo "====================="
echo "🌐 URL: http://$REMOTE_HOST"
echo "📁 Chemin serveur: $REMOTE_PATH"
echo "💾 Sauvegardes: $BACKUP_PATH"
echo ""
echo "📋 ÉTAPES SUIVANTES RECOMMANDÉES:"
echo "1. 🔒 Configurer HTTPS avec Let's Encrypt"
echo "2. 🔍 Vérifier les logs: sudo tail -f /var/log/nginx/error.log"
echo "3. 📊 Configurer la surveillance"
echo "4. 🔄 Tester toutes les fonctionnalités"
echo ""

print_success "Déploiement réussi!"