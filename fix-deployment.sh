#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# 🔧 CORRECTION ET FINALISATION DU DÉPLOIEMENT
# ═══════════════════════════════════════════════════════════════════════════════

set -e

echo "🔧 Correction de la configuration Supabase..."

# Configuration .env complète pour Supabase
ssh root@82.25.116.122 << 'ENDSSH'
cd /opt/ges-cab/supabase-docker/docker

# Arrêter les services en cours
docker-compose down || true

# Configuration .env complète
cat > .env << 'EOF'
############
# SECRETS
############
POSTGRES_PASSWORD=GEScab2024!SuperSecure
POSTGRES_DB=ges_cab_prod
POSTGRES_USER=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432

JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc2NhYiJ9
JWT_EXPIRY=3600

ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc2NhYiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk4NzQwMDAwfQ.xyz123
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc2NhYiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2OTg3NDAwMDB9.abc456

############
# DATABASE
############
POSTGRES_DATA_VOLUME_PATH=/opt/ges-cab/volumes/db

############
# API PROXY
############
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443

############
# STUDIO
############
STUDIO_PORT=3001
STUDIO_DEFAULT_ORGANIZATION=ges-cab
STUDIO_DEFAULT_PROJECT=production

DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=Admin2024!Secure

############
# FUNCTIONS
############
FUNCTIONS_VERIFY_JWT=false

############
# STORAGE
############
GLOBAL_S3_BUCKET=supabase-storage

############
# AUTH
############
SITE_URL=https://app.ges-cab.com
API_EXTERNAL_URL=https://api.ges-cab.com
ADDITIONAL_REDIRECT_URLS=https://app.ges-cab.com/*,https://studio.ges-cab.com/*

DISABLE_SIGNUP=true
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
ENABLE_PHONE_SIGNUP=false
ENABLE_PHONE_AUTOCONFIRM=false
ENABLE_ANONYMOUS_USERS=false

############
# EMAIL
############
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@ges-cab.com
SMTP_PASS=changeme
SMTP_ADMIN_EMAIL=admin@ges-cab.com
SMTP_SENDER_NAME=Ges-Cab

MAILER_URLPATHS_INVITE=/auth/v1/verify
MAILER_URLPATHS_CONFIRMATION=/auth/v1/verify
MAILER_URLPATHS_RECOVERY=/auth/v1/verify
MAILER_URLPATHS_EMAIL_CHANGE=/auth/v1/verify

############
# MISC
############
SECRET_KEY_BASE=super-secret-key-change-this-in-production-please
PG_META_CRYPTO_KEY=your-pg-meta-crypto-key-here
VAULT_ENC_KEY=your-vault-encryption-key-here

LOGFLARE_PRIVATE_ACCESS_TOKEN=your-logflare-private-token
LOGFLARE_PUBLIC_ACCESS_TOKEN=your-logflare-public-token

DOCKER_SOCKET_LOCATION=/var/run/docker.sock

############
# POOLER
############
POOLER_DEFAULT_POOL_SIZE=20
POOLER_MAX_CLIENT_CONN=100
POOLER_DB_POOL_SIZE=10
POOLER_TENANT_ID=tenant1
POOLER_PROXY_PORT_TRANSACTION=6543

############
# POSTGREST
############
PGRST_DB_SCHEMAS=public,storage,graphql_public

############
# IMGPROXY
############
IMGPROXY_ENABLE_WEBP_DETECTION=true
EOF

echo "✅ Configuration .env créée"

# Créer les répertoires nécessaires
mkdir -p /opt/ges-cab/volumes/db
mkdir -p /opt/ges-cab/volumes/storage

# Démarrer les services
echo "🚀 Démarrage des services Supabase..."
docker-compose up -d

echo "⏳ Attente du démarrage (60 secondes)..."
sleep 60

# Vérifier le statut
echo "📊 Statut des services :"
docker-compose ps

# Initialiser la base de données
echo "📊 Initialisation de la base de données..."
sleep 10
docker exec -i $(docker-compose ps -q db) psql -U postgres -d ges_cab_prod < /opt/ges-cab/database/complete_schema.sql 2>/dev/null || echo "Base déjà initialisée"

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "========================="
echo ""
echo "🔗 URLs d'accès :"
echo "  • Application : http://app.ges-cab.com"
echo "  • API : http://api.ges-cab.com/api/"  
echo "  • Studio : http://studio.ges-cab.com/studio/"
echo ""
echo "🔐 Accès Studio Supabase :"
echo "  Utilisateur : admin"
echo "  Mot de passe : Admin2024!Secure"
echo ""
echo "⚠️  Pour activer HTTPS :"
echo "  certbot --nginx -d app.ges-cab.com -d api.ges-cab.com -d studio.ges-cab.com"
echo ""

ENDSSH

echo ""
echo "🎯 FINALISATION RÉUSSIE !"
echo "========================="
echo ""
echo "🔗 Testez votre application :"
echo "   http://app.ges-cab.com"
echo ""
echo "🎛️ Interface d'administration :"
echo "   http://studio.ges-cab.com/studio/"
echo "   Utilisateur: admin"  
echo "   Mot de passe: Admin2024!Secure"