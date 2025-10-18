#!/bin/bash

# Script de déploiement automatisé - Ges-Cab Production avec SSH
# Version utilisant la configuration SSH

set -e

# Configuration
ENV=${1:-production}
REMOTE_ALIAS="ges-cab-server"  # Utilise l'alias SSH configuré
REMOTE_PATH="/var/www/ges-cab"
BACKUP_PATH="/var/www/backups/ges-cab"
SOURCE_PATH="/opt/ges-cab-source"

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
echo "Configuration SSH requise"
echo "=============================================="

# Vérifications préalables
print_step "Vérifications préalables..."

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ] || [ ! -f "vite.config.js" ]; then
    print_error "Ce script doit être exécuté depuis la racine du projet Ges-Cab"
    exit 1
fi

# Vérifier la configuration SSH
if ! grep -q "Host ges-cab-server" ~/.ssh/config 2>/dev/null; then
    print_error "Configuration SSH manquante pour ges-cab-server"
    print_info "Exécutez d'abord: ./setup-ssh-key.sh"
    exit 1
fi

print_success "Configuration validée"

# Test de connectivité SSH
print_step "Test de connectivité SSH..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes $REMOTE_ALIAS exit 2>/dev/null; then
    print_success "Connexion SSH OK"
else
    print_error "Impossible de se connecter via SSH"
    print_info "Vérifiez votre configuration avec: ssh ges-cab-server"
    print_info "Si nécessaire, reconfigurez avec: ./setup-ssh-key.sh"
    exit 1
fi

# Construction locale
print_step "Construction de l'application..."

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    print_step "Installation des dépendances..."
    npm install
fi

# Build
npm run build
print_success "Application construite"

# Création des répertoires sur le serveur
print_step "Préparation des répertoires sur le serveur..."
ssh $REMOTE_ALIAS "
    mkdir -p $REMOTE_PATH
    mkdir -p $BACKUP_PATH
    mkdir -p $SOURCE_PATH
    mkdir -p /var/log/ges-cab
"
print_success "Répertoires préparés"

# Sauvegarde de la version actuelle
print_step "Sauvegarde de la version actuelle..."
ssh $REMOTE_ALIAS "
    if [ -d $REMOTE_PATH ] && [ \$(ls -A $REMOTE_PATH 2>/dev/null | wc -l) -gt 0 ]; then
        BACKUP_NAME=ges-cab-backup-\$(date +%Y%m%d-%H%M%S)
        cp -r $REMOTE_PATH $BACKUP_PATH/\$BACKUP_NAME
        echo 'Sauvegarde créée: \$BACKUP_NAME'
    fi
    
    if [ -d $SOURCE_PATH ] && [ \$(ls -A $SOURCE_PATH 2>/dev/null | wc -l) -gt 0 ]; then
        BACKUP_NAME=ges-cab-source-backup-\$(date +%Y%m%d-%H%M%S)
        cp -r $SOURCE_PATH $BACKUP_PATH/\$BACKUP_NAME
        echo 'Source sauvegardée: \$BACKUP_NAME'
    fi
"
print_success "Sauvegarde terminée"

# Arrêt temporaire des services
print_step "Arrêt temporaire des services..."
ssh $REMOTE_ALIAS "
    pkill -f 'vite preview' || echo 'Aucun processus Vite à arrêter'
    pkill -f 'npm run preview' || echo 'Aucun processus npm preview à arrêter'
    pkill -f 'node.*3000' || echo 'Aucun processus Node sur port 3000'
    sleep 3
"
print_success "Services arrêtés"

# Déploiement des fichiers statiques
print_step "Déploiement des fichiers statiques (dist)..."
rsync -avz --delete \
    --progress \
    dist/ $REMOTE_ALIAS:$REMOTE_PATH/

print_success "Fichiers statiques déployés"

# Déploiement du code source complet
print_step "Déploiement du code source..."
rsync -avz --delete \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='.env*' \
    --progress \
    . $REMOTE_ALIAS:$SOURCE_PATH/

print_success "Code source déployé"

# Déploiement des configurations et scripts
print_step "Déploiement des configurations..."

# Copier tous les scripts et configs
scp nginx-production-complete.conf $REMOTE_ALIAS:/etc/nginx/sites-available/ges-cab
scp fix-ges-cab-errors.sh $REMOTE_ALIAS:/root/
scp deploy-nginx-fix.sh $REMOTE_ALIAS:/root/
scp configure-dns.sh $REMOTE_ALIAS:/root/

ssh $REMOTE_ALIAS "
    chmod +x /root/*.sh
    
    # Configuration Nginx
    ln -sf /etc/nginx/sites-available/ges-cab /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    rm -f /etc/nginx/sites-enabled/www.ges-cab.com
    
    # Test et rechargement Nginx
    if nginx -t; then
        systemctl reload nginx
        echo 'Nginx rechargé avec succès'
    else
        echo 'Erreur dans la configuration Nginx'
        exit 1
    fi
"
print_success "Configurations déployées"

# Installation des dépendances et démarrage
print_step "Installation des dépendances sur le serveur..."
ssh $REMOTE_ALIAS "
    cd $SOURCE_PATH
    
    # Installation des dépendances
    npm install --production
    
    # Démarrage de l'application
    nohup npm run preview > /var/log/ges-cab/app.log 2>&1 &
    
    sleep 5
    
    # Vérification du démarrage
    if ss -tlnp | grep -q ':3000'; then
        echo 'Application démarrée avec succès sur le port 3000'
    else
        echo 'Erreur: Application non démarrée'
        tail -n 20 /var/log/ges-cab/app.log
        exit 1
    fi
"
print_success "Application démarrée"

# Vérification complète des services
print_step "Vérification des services..."
ssh $REMOTE_ALIAS "
    echo '=== ÉTAT DES SERVICES ==='
    
    # Nginx
    if systemctl is-active --quiet nginx; then
        echo '✅ Nginx: Actif'
    else
        echo '❌ Nginx: Inactif'
    fi
    
    # Application
    if ss -tlnp | grep -q ':3000'; then
        APP_PID=\$(ss -tlnp | grep ':3000' | grep -o 'pid=[0-9]*' | cut -d'=' -f2)
        echo \"✅ Application (port 3000): Démarrée (PID: \$APP_PID)\"
    else
        echo '❌ Application (port 3000): Non démarrée'
    fi
    
    # Certificats SSL
    if [ -f /etc/letsencrypt/live/ges-cab.com-0001/fullchain.pem ]; then
        CERT_EXPIRY=\$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/ges-cab.com-0001/fullchain.pem | cut -d= -f2)
        echo \"✅ Certificat SSL: Valide (expire: \$CERT_EXPIRY)\"
    else
        echo '⚠️  Certificat SSL: À configurer'
    fi
    
    echo '=== LOGS RÉCENTS ==='
    tail -n 5 /var/log/ges-cab/app.log
"
print_success "Vérification terminée"

# Tests de santé
print_step "Tests de santé de l'application..."

# Test local sur le serveur
ssh $REMOTE_ALIAS "
    echo 'Test local (localhost:3000):'
    LOCAL_STATUS=\$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 || echo '000')
    echo \"Status code: \$LOCAL_STATUS\"
    
    if [ \"\$LOCAL_STATUS\" = \"200\" ]; then
        echo '✅ Test local réussi'
    else
        echo '⚠️  Test local échoué'
    fi
"

# Test externe
print_info "Test externe (https://ges-cab.com)..."
sleep 5

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://ges-cab.com 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    print_success "✅ Site public accessible - Code: $HTTP_CODE"
elif [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "502" ]; then
    print_warning "⚠️  Site retourne $HTTP_CODE - Configuration DNS/SSL peut être nécessaire"
else
    print_warning "⚠️  Site retourne le code: $HTTP_CODE"
fi

# Instructions post-déploiement
echo ""
print_success "🎉 DÉPLOIEMENT TERMINÉ!"
echo ""
print_info "📊 RÉSUMÉ DU DÉPLOIEMENT:"
print_info "• Application: Déployée dans $SOURCE_PATH"
print_info "• Fichiers web: Servis depuis $REMOTE_PATH"
print_info "• Logs: /var/log/ges-cab/app.log"
print_info "• Config Nginx: /etc/nginx/sites-available/ges-cab"
echo ""

print_info "🌐 ACCÈS:"
print_info "• Site principal: https://ges-cab.com"
print_info "• Status local: ssh ges-cab-server 'curl localhost:3000'"
echo ""

print_info "🛠️  MAINTENANCE:"
print_info "• Logs temps réel: ssh ges-cab-server 'tail -f /var/log/ges-cab/app.log'"
print_info "• Redémarrer app: ssh ges-cab-server 'pkill -f vite && cd $SOURCE_PATH && nohup npm run preview > /var/log/ges-cab/app.log 2>&1 &'"
print_info "• Redémarrer Nginx: ssh ges-cab-server 'systemctl restart nginx'"
print_info "• Diagnostic: ssh ges-cab-server '/root/fix-ges-cab-errors.sh'"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    print_success "🚀 Déploiement réussi! Votre application est en ligne!"
else
    print_warning "⚠️  Déploiement terminé mais vérifiez les DNS/SSL pour l'accès externe"
    print_info "Utilisez: ssh ges-cab-server '/root/configure-dns.sh' pour l'aide DNS"
fi