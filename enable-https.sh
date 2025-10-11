#!/bin/bash

echo "🔐 Configuration HTTPS automatique pour Ges-Cab"
echo "================================================"
echo ""

# Vérification de la résolution DNS
echo "🔍 Vérification du DNS..."
for domain in app.ges-cab.com api.ges-cab.com studio.ges-cab.com; do
    if nslookup $domain | grep -q "82.25.116.122"; then
        echo "✅ $domain résolu correctement"
    else
        echo "❌ $domain ne pointe pas vers 82.25.116.122"
        echo ""
        echo "⚠️ Veuillez configurer les enregistrements DNS A suivants :"
        echo "   app.ges-cab.com -> 82.25.116.122"
        echo "   api.ges-cab.com -> 82.25.116.122" 
        echo "   studio.ges-cab.com -> 82.25.116.122"
        echo ""
        echo "Et relancer ce script une fois le DNS propagé (peut prendre jusqu'à 24h)"
        exit 1
    fi
done

echo ""
echo "🎉 DNS configuré correctement ! Procédure d'installation HTTPS..."

# Configuration HTTPS
ssh root@82.25.116.122 << 'EOF'

# Basculer vers la configuration avec domaines
echo "📝 Activation de la configuration avec domaines..."
rm -f /etc/nginx/sites-enabled/ges-cab-temp
ln -sf /etc/nginx/sites-available/ges-cab /etc/nginx/sites-enabled/

# Test de la configuration
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Erreur dans la configuration Nginx"
    exit 1
fi

# Rechargement
systemctl reload nginx

# Obtention des certificats SSL
echo "🔐 Obtention des certificats SSL..."
certbot --nginx --non-interactive --agree-tos --email admin@ges-cab.com \
    -d app.ges-cab.com \
    -d api.ges-cab.com \
    -d studio.ges-cab.com

# Configuration du renouvellement automatique
systemctl enable certbot.timer
systemctl start certbot.timer

echo ""
echo "🎉 HTTPS CONFIGURÉ AVEC SUCCÈS !"
echo "================================"
echo ""
echo "🔗 Accès sécurisés :"
echo "  • Application : https://app.ges-cab.com"
echo "  • API : https://api.ges-cab.com" 
echo "  • Studio : https://studio.ges-cab.com"
echo ""

EOF