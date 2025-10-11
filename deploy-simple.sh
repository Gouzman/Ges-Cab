#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 DÉPLOIEMENT SIMPLE GES-CAB (MOINS DE CONNEXIONS SSH)
# ═══════════════════════════════════════════════════════════════════════════════

set -e

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

DOMAIN="app.ges-cab.com"
VPS_CONNECTION="root@82.25.116.122"

print_step "🚀 Déploiement Ges-Cab Simplifié"
print_step "   Domaine: $DOMAIN"
print_step "   Serveur: $VPS_CONNECTION"

# Build local
print_step "1️⃣ Build de l'application..."
npm run build
print_success "Build terminé"

# Création du package
print_step "2️⃣ Création du package..."
tar -czf ges-cab-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    dist/ database/ config/ scripts/ package.json

print_success "Package créé"

# Transfert et installation en une seule connexion SSH
print_step "3️⃣ Transfert et installation..."
print_warning "Vous devrez saisir le mot de passe root 2-3 fois maximum"

# Transfert du fichier
scp ges-cab-deploy.tar.gz $VPS_CONNECTION:/tmp/

# Script d'installation complet à exécuter sur le serveur
ssh $VPS_CONNECTION << 'ENDSSH'
#!/bin/bash
set -e

echo "🔧 Installation sur le serveur..."

# Mise à jour du système
apt update && apt upgrade -y

# Installation des dépendances essentielles
if ! command -v docker &> /dev/null; then
    echo "📦 Installation de Docker..."
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker root
fi

if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installation de Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

if ! command -v nginx &> /dev/null; then
    echo "📦 Installation de Nginx..."
    apt install -y nginx
fi

if ! command -v certbot &> /dev/null; then
    echo "📦 Installation de Certbot..."
    apt install -y certbot python3-certbot-nginx
fi

# Création du répertoire et extraction
mkdir -p /opt/ges-cab
cd /opt/ges-cab
tar -xzf /tmp/ges-cab-deploy.tar.gz
rm /tmp/ges-cab-deploy.tar.gz

# Configuration Supabase
if [ ! -d "supabase-docker" ]; then
    echo "📥 Téléchargement de Supabase..."
    git clone --depth 1 https://github.com/supabase/supabase.git supabase-docker
fi

cd supabase-docker/docker

# Configuration .env pour Supabase
cat > .env << EOF
PROJECT_NAME=ges-cab
SITE_URL=https://app.ges-cab.com
API_EXTERNAL_URL=https://api.ges-cab.com
SUPABASE_PUBLIC_URL=https://api.ges-cab.com

POSTGRES_PASSWORD=$(openssl rand -base64 16)
POSTGRES_DB=ges_cab_prod
POSTGRES_USER=postgres

JWT_SECRET=$(openssl rand -base64 32)
ANON_KEY=$(openssl rand -base64 32)
SERVICE_ROLE_KEY=$(openssl rand -base64 32)

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@ges-cab.com
SMTP_PASS=your_app_password

STUDIO_DEFAULT_ORGANIZATION=ges-cab
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=$(openssl rand -base64 16)

KONG_HTTP_PORT=8000
STUDIO_PORT=3001
EOF

echo "✅ Configuration Supabase créée"

# Configuration Nginx simple
cat > /etc/nginx/sites-available/ges-cab << 'NGINXEOF'
server {
    listen 80;
    server_name app.ges-cab.com api.ges-cab.com studio.ges-cab.com;
    
    # Application principale
    location / {
        root /opt/ges-cab/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
    
    # API Supabase
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Studio Supabase
    location /studio/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINXEOF

# Activation du site
ln -sf /etc/nginx/sites-available/ges-cab /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "✅ Nginx configuré"

# Démarrage de Supabase
cd /opt/ges-cab/supabase-docker/docker
docker-compose up -d

echo "⏳ Attente du démarrage des services..."
sleep 30

# Initialisation de la base de données
echo "📊 Initialisation de la base de données..."
docker exec -i $(docker-compose ps -q db) psql -U postgres -d ges_cab_prod < /opt/ges-cab/database/complete_schema.sql || echo "Schema déjà appliqué"

echo "🎉 Installation terminée !"
echo ""
echo "📋 Informations de connexion :"
echo "Application: http://app.ges-cab.com"
echo "API: http://api.ges-cab.com/api/"
echo "Studio: http://studio.ges-cab.com/studio/"
echo ""
echo "🔐 Identifiants Studio :"
grep "DASHBOARD_USERNAME=" .env
grep "DASHBOARD_PASSWORD=" .env
echo ""
echo "⚠️  Configurez SSL avec: certbot --nginx -d app.ges-cab.com -d api.ges-cab.com -d studio.ges-cab.com"

ENDSSH

# Nettoyage local
rm -f ges-cab-deploy.tar.gz

print_success "🎉 Déploiement terminé !"
echo ""
echo "🔗 Votre application est accessible sur :"
echo "   • Application : http://app.ges-cab.com"
echo "   • API : http://api.ges-cab.com/api/"
echo "   • Studio : http://studio.ges-cab.com/studio/"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Testez l'accès HTTP (sans SSL pour l'instant)"
echo "   2. Configurez SSL : ssh $VPS_CONNECTION 'certbot --nginx -d app.ges-cab.com -d api.ges-cab.com -d studio.ges-cab.com'"
echo "   3. Votre application sera alors accessible en HTTPS"