#!/bin/bash

echo "🚀 DÉPLOIEMENT STAGING"
echo "====================="

# Variables
STAGING_SERVER="82.25.116.122"
STAGING_PORT="3001"
STAGING_DIR="/var/www/ges-cab-staging"

echo "📦 Build de l'application..."
npm run build

echo "📤 Upload vers le serveur staging..."
# Commandes de déploiement à personnaliser
echo "scp -r dist/* user@$STAGING_SERVER:$STAGING_DIR/"
echo "ssh user@$STAGING_SERVER 'systemctl restart ges-cab-staging'"

echo "✅ Staging déployé sur http://$STAGING_SERVER:$STAGING_PORT"
