#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 SCRIPT DE DÉPLOIEMENT PRODUCTION GES-CAB
# ═══════════════════════════════════════════════════════════════════════════════
# Déploiement avec Supabase Self-Hosted sur VPS
# Usage: ./scripts/deploy-production.sh [DOMAIN] [USER@VPS_IP]
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ CONFIGURATION ET VARIABLES                                                    │
# └───────────────────────────────────────────────────────────────────────────────┘

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_step() { echo -e "${BLUE}📋 $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${CYAN}ℹ️  $1${NC}"; }

# Variables de configuration
PROJECT_NAME="ges-cab"
APP_PORT="3000"
API_PORT="8000"
DB_PORT="5432"
STUDIO_PORT="3001"

# Vérification des paramètres
if [ $# -ne 2 ]; then
    echo "Usage: $0 [DOMAIN] [USER@VPS_IP]"
    echo "Exemple: $0 ges-cab.com root@192.168.1.100"
    exit 1
fi

DOMAIN=$1
VPS_CONNECTION=$2
VPS_USER=$(echo $VPS_CONNECTION | cut -d'@' -f1)
VPS_IP=$(echo $VPS_CONNECTION | cut -d'@' -f2)

# Configuration par défaut pour votre projet
DEFAULT_DOMAIN="ges-cab.com"
DEFAULT_VPS="root@82.25.116.122"

# Utiliser les valeurs par défaut si pas de paramètres
if [ $# -eq 0 ]; then
    DOMAIN=$DEFAULT_DOMAIN
    VPS_CONNECTION=$DEFAULT_VPS
    VPS_USER="root"
    VPS_IP="82.25.116.122"
    print_step "🚀 Utilisation de la configuration par défaut"
    print_step "   Domaine: $DOMAIN"
    print_step "   Serveur: $VPS_CONNECTION"
elif [ $# -ne 2 ]; then
    echo "Usage: $0 [DOMAIN] [USER@VPS_IP]"
    echo "Ou sans paramètres pour utiliser la configuration par défaut:"
    echo "   Domaine: $DEFAULT_DOMAIN"
    echo "   Serveur: $DEFAULT_VPS"
    exit 1
else
    DOMAIN=$1
    VPS_CONNECTION=$2
    VPS_USER=$(echo $VPS_CONNECTION | cut -d'@' -f1)
    VPS_IP=$(echo $VPS_CONNECTION | cut -d'@' -f2)
fi

print_step "🚀 Déploiement de Ges-Cab sur $DOMAIN ($VPS_IP)"

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ ÉTAPE 1: PRÉPARATION LOCAL                                                    │
# └───────────────────────────────────────────────────────────────────────────────┘

print_step "1️⃣ Préparation de l'environnement local..."

# Build de l'application
print_info "Construction de l'application React..."
npm run build
print_success "Build React terminé"

# Création du package de déploiement
print_info "Création du package de déploiement..."
tar -czf ges-cab-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.env*' \
    dist/ \
    database/ \
    config/ \
    scripts/ \
    package.json \
    package-lock.json

print_success "Package créé: ges-cab-deploy.tar.gz"

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ ÉTAPE 2: VÉRIFICATION DE LA CONNEXION VPS                                    │
# └───────────────────────────────────────────────────────────────────────────────┘

print_step "2️⃣ Vérification de la connexion au VPS..."

print_warning "Authentification par mot de passe détectée"
print_info "Vous devrez saisir le mot de passe root plusieurs fois pendant le processus"
print_info "Test de connexion SSH..."

# Test de connexion plus simple
if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $VPS_CONNECTION "echo 'Connexion réussie'"; then
    print_success "Connexion VPS établie"
else
    print_error "Impossible de se connecter au VPS. Vérifiez :"
    print_error "  • L'adresse IP : $VPS_IP"
    print_error "  • Le mot de passe root"
    print_error "  • La connectivité réseau"
    exit 1
fi

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ ÉTAPE 3: INSTALLATION DES DÉPENDANCES SUR LE VPS                             │
# └───────────────────────────────────────────────────────────────────────────────┘

print_step "3️⃣ Installation des dépendances sur le VPS..."

ssh $VPS_CONNECTION << 'ENDSSH'
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Docker et Docker Compose
if ! command -v docker &> /dev/null; then
    echo "📦 Installation de Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installation de Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Installation de Node.js (pour les outils de build si nécessaire)
if ! command -v node &> /dev/null; then
    echo "📦 Installation de Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Installation de Nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 Installation de Nginx..."
    sudo apt install -y nginx
fi

# Installation de Certbot pour SSL
if ! command -v certbot &> /dev/null; then
    echo "📦 Installation de Certbot..."
    sudo apt install -y certbot python3-certbot-nginx
fi

echo "✅ Toutes les dépendances sont installées"
ENDSSH

print_success "Dépendances installées sur le VPS"

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ ÉTAPE 4: TRANSFERT DES FICHIERS                                               │
# └───────────────────────────────────────────────────────────────────────────────┘

print_step "4️⃣ Transfert des fichiers vers le VPS..."

# Créer les répertoires de destination
ssh $VPS_CONNECTION "mkdir -p /opt/ges-cab /opt/ges-cab/backups"

# Transférer le package
print_info "Transfert du package d'application..."
scp ges-cab-deploy.tar.gz $VPS_CONNECTION:/opt/ges-cab/
ssh $VPS_CONNECTION "cd /opt/ges-cab && tar -xzf ges-cab-deploy.tar.gz && rm ges-cab-deploy.tar.gz"

print_success "Fichiers transférés"

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ ÉTAPE 5: CONFIGURATION SUPABASE SELF-HOSTED                                  │
# └───────────────────────────────────────────────────────────────────────────────┘

print_step "5️⃣ Configuration de Supabase Self-Hosted..."

# Créer le docker-compose pour Supabase
ssh $VPS_CONNECTION << ENDSSH
cd /opt/ges-cab

# Télécharger Supabase self-hosted
if [ ! -d "supabase-docker" ]; then
    git clone --depth 1 https://github.com/supabase/supabase.git supabase-docker
    cd supabase-docker/docker
else
    cd supabase-docker/docker
    git pull
fi

# Copier le fichier de configuration
cp .env.example .env

# Configuration personnalisée
cat > .env << EOF
# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION SUPABASE SELF-HOSTED - GES-CAB PRODUCTION
# ═══════════════════════════════════════════════════════════════════════════════

# Configuration du projet
PROJECT_NAME=ges-cab
SITE_URL=https://$DOMAIN
ADDITIONAL_REDIRECT_URLS=https://$DOMAIN/*,https://studio.$DOMAIN/*

# Configuration API
API_EXTERNAL_URL=https://api.$DOMAIN
SUPABASE_PUBLIC_URL=https://api.$DOMAIN

# Configuration base de données
POSTGRES_PASSWORD=\$(openssl rand -base64 16)
POSTGRES_DB=ges_cab_prod
POSTGRES_USER=postgres
POSTGRES_PORT=5432

# Configuration JWT
JWT_SECRET=\$(openssl rand -base64 32 | tr -d "\\n")
JWT_EXPIRY=3600

# Clés API (générer des clés sécurisées)
ANON_KEY=\$(openssl rand -base64 32 | tr -d "\\n")
SERVICE_ROLE_KEY=\$(openssl rand -base64 32 | tr -d "\\n")

# Configuration email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@$DOMAIN
SMTP_PASS=your_app_password
SMTP_ADMIN_EMAIL=admin@$DOMAIN
SMTP_SENDER_NAME="Ges-Cab"

# Configuration sécurité
ENABLE_ANONYMOUS_USERS=false
DISABLE_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
ENABLE_EMAIL_SIGNUP=true
ENABLE_PHONE_SIGNUP=false

# Configuration Dashboard
STUDIO_DEFAULT_ORGANIZATION=ges-cab
STUDIO_DEFAULT_PROJECT=production
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=\$(openssl rand -base64 16)

# Ports
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443
STUDIO_PORT=3001

# Configuration métadonnées
LOGFLARE_PRIVATE_ACCESS_TOKEN=\$(openssl rand -base64 16)
LOGFLARE_PUBLIC_ACCESS_TOKEN=\$(openssl rand -base64 16)
EOF

echo "✅ Configuration Supabase créée"
ENDSSH

print_success "Configuration Supabase Self-Hosted créée"

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ ÉTAPE 6: CONFIGURATION NGINX                                                  │
# └───────────────────────────────────────────────────────────────────────────────┘

print_step "6️⃣ Configuration de Nginx..."

# Créer la configuration Nginx
ssh $VPS_CONNECTION << ENDSSH
# Configuration principale pour l'application
cat > /etc/nginx/sites-available/ges-cab << 'EOF'
# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION NGINX - GES-CAB PRODUCTION
# ═══════════════════════════════════════════════════════════════════════════════

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# Configuration principale HTTPS
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # Configuration SSL (sera complétée par Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Sécurité SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    
    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Configuration du document root
    root /opt/ges-cab/dist;
    index index.html;
    
    # Gestion des fichiers statiques
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Route pour l'application React (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Configuration pour les gros uploads
    client_max_body_size 50M;
    
    # Logs
    access_log /var/log/nginx/ges-cab.access.log;
    error_log /var/log/nginx/ges-cab.error.log;
}

# Configuration API Supabase
server {
    listen 443 ssl http2;
    server_name api.$DOMAIN;
    
    # Configuration SSL
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Proxy vers Supabase Kong Gateway
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}

# Configuration Supabase Studio
server {
    listen 443 ssl http2;
    server_name studio.$DOMAIN;
    
    # Configuration SSL
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Proxy vers Supabase Studio
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Activer le site
sudo ln -sf /etc/nginx/sites-available/ges-cab /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Configuration Nginx créée"
ENDSSH

print_success "Configuration Nginx créée"

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ ÉTAPE 7: CERTIFICATS SSL                                                      │
# └───────────────────────────────────────────────────────────────────────────────┘

print_step "7️⃣ Configuration des certificats SSL..."

ssh $VPS_CONNECTION << ENDSSH
# Arrêt temporaire de Nginx pour Certbot
sudo systemctl stop nginx

# Obtention des certificats SSL
sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN -d studio.$DOMAIN --agree-tos --no-eff-email --email admin@$DOMAIN

# Redémarrage de Nginx
sudo systemctl start nginx

# Configuration du renouvellement automatique
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

echo "✅ Certificats SSL configurés"
ENDSSH

print_success "Certificats SSL configurés"

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ ÉTAPE 8: DÉMARRAGE DES SERVICES                                               │
# └───────────────────────────────────────────────────────────────────────────────┘

print_step "8️⃣ Démarrage des services..."

ssh $VPS_CONNECTION << 'ENDSSH'
cd /opt/ges-cab/supabase-docker/docker

# Démarrage de Supabase
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services Supabase..."
sleep 30

# Vérification du statut
docker-compose ps

echo "✅ Services démarrés"
ENDSSH

print_success "Services Supabase démarrés"

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ ÉTAPE 9: INITIALISATION DE LA BASE DE DONNÉES                                │
# └───────────────────────────────────────────────────────────────────────────────┘

print_step "9️⃣ Initialisation de la base de données..."

ssh $VPS_CONNECTION << 'ENDSSH'
cd /opt/ges-cab

# Exécution du schéma de base de données
echo "📊 Création du schéma de base de données..."
docker exec -i supabase-docker_db_1 psql -U postgres -d ges_cab_prod < database/complete_schema.sql

echo "✅ Base de données initialisée"
ENDSSH

print_success "Base de données initialisée"

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ ÉTAPE 10: CONFIGURATION DE L'APPLICATION                                     │
# └───────────────────────────────────────────────────────────────────────────────┘

print_step "🔟 Configuration finale de l'application..."

# Récupérer les clés API générées
print_info "Récupération des clés de configuration..."

ssh $VPS_CONNECTION << 'ENDSSH'
cd /opt/ges-cab/supabase-docker/docker

# Extraire les informations importantes du .env
echo "📋 Informations de configuration :"
echo "=================================="
echo "🔗 URL de l'application : https://$DOMAIN"
echo "🔗 URL de l'API : https://api.$DOMAIN"
echo "🔗 Studio Supabase : https://studio.$DOMAIN"
echo ""
echo "🔑 Clés API (à configurer dans votre application) :"
echo "VITE_SUPABASE_URL=https://api.$DOMAIN"
grep "ANON_KEY=" .env
grep "SERVICE_ROLE_KEY=" .env
echo ""
echo "🔐 Accès Studio :"
grep "DASHBOARD_USERNAME=" .env
grep "DASHBOARD_PASSWORD=" .env
ENDSSH

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ ÉTAPE 11: SCRIPTS DE MAINTENANCE                                              │
# └───────────────────────────────────────────────────────────────────────────────┘

print_step "1️⃣1️⃣ Création des scripts de maintenance..."

ssh $VPS_CONNECTION << 'ENDSSH'
# Script de backup
cat > /opt/ges-cab/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/ges-cab/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup de la base de données
docker exec supabase-docker_db_1 pg_dump -U postgres ges_cab_prod > "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup des fichiers de l'application
tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" /opt/ges-cab/dist

# Nettoyage des anciens backups (garde les 7 derniers)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup terminé : $DATE"
EOF

chmod +x /opt/ges-cab/backup.sh

# Planifier les backups quotidiens
echo "0 2 * * * /opt/ges-cab/backup.sh >> /var/log/ges-cab-backup.log 2>&1" | crontab -

echo "✅ Scripts de maintenance créés"
ENDSSH

print_success "Scripts de maintenance créés"

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ FINALISATION                                                                  │
# └───────────────────────────────────────────────────────────────────────────────┘

# Nettoyage local
rm -f ges-cab-deploy.tar.gz

print_success "🎉 Déploiement terminé avec succès !"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}🚀 VOTRE APPLICATION GES-CAB EST EN LIGNE !${NC}"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo -e "${CYAN}🔗 URLs d'accès :${NC}"
echo "   • Application : https://$DOMAIN"
echo "   • API Supabase : https://api.$DOMAIN"
echo "   • Studio Supabase : https://studio.$DOMAIN"
echo ""
echo -e "${YELLOW}📋 Prochaines étapes :${NC}"
echo "   1. Connectez-vous à Studio Supabase pour créer le premier utilisateur admin"
echo "   2. Configurez les paramètres SMTP dans le .env de Supabase"
echo "   3. Testez toutes les fonctionnalités de l'application"
echo "   4. Planifiez des backups réguliers (déjà configurés)"
echo ""
echo -e "${GREEN}✅ Votre cabinet juridique numérique est prêt !${NC}"
echo "═══════════════════════════════════════════════════════════════════════════════"