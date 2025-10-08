#!/bin/bash

# Configuration HTTPS avec Let's Encrypt pour Ges-Cab
# À exécuter sur le serveur de production

DOMAIN="votre-domaine.com"
EMAIL="votre-email@example.com"

echo "🔒 CONFIGURATION HTTPS AVEC LET'S ENCRYPT"
echo "========================================="

# Installation de Certbot
echo "📦 Installation de Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Obtention du certificat SSL
echo "🔐 Obtention du certificat SSL..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL

# Configuration du renouvellement automatique
echo "🔄 Configuration du renouvellement automatique..."
sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

# Test du renouvellement
echo "🧪 Test du renouvellement..."
sudo certbot renew --dry-run

echo "✅ HTTPS configuré avec succès!"
echo "🌐 Votre site est maintenant accessible via https://$DOMAIN"