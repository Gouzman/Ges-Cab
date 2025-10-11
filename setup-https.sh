#!/bin/bash

echo "🔧 Configuration HTTPS et correction de la configuration Nginx..."

# Connexion SSH et correction
ssh root@82.25.116.122 << 'EOF'

# 1. Corriger la configuration Nginx
echo "📝 Correction de la configuration Nginx..."
cat > /etc/nginx/sites-available/ges-cab << 'NGINX_CONFIG'
server {
    listen 80;
    server_name app.ges-cab.com;
    
    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.ges-cab.com;
    
    # Application principale
    location / {
        root /opt/ges-cab/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
    
    # Configuration SSL (sera ajoutée par Certbot)
}

server {
    listen 80;
    server_name api.ges-cab.com;
    
    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.ges-cab.com;
    
    # API Supabase via Kong
    location / {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
    
    # Configuration SSL (sera ajoutée par Certbot)
}

server {
    listen 80;
    server_name studio.ges-cab.com;
    
    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name studio.ges-cab.com;
    
    # Studio Supabase
    location / {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
    
    # Configuration SSL (sera ajoutée par Certbot)
}
NGINX_CONFIG

# 2. Test de la configuration
echo "🧪 Test de la configuration Nginx..."
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Erreur dans la configuration Nginx"
    exit 1
fi

# 3. Installation de Certbot si nécessaire
if ! command -v certbot &> /dev/null; then
    echo "📦 Installation de Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# 4. Rechargement de Nginx
echo "🔄 Rechargement de Nginx..."
systemctl reload nginx

# 5. Obtention des certificats SSL
echo "🔐 Obtention des certificats SSL Let's Encrypt..."
certbot --nginx --non-interactive --agree-tos --email admin@ges-cab.com \
    -d app.ges-cab.com \
    -d api.ges-cab.com \
    -d studio.ges-cab.com

# 6. Configuration du renouvellement automatique
echo "⏰ Configuration du renouvellement automatique..."
systemctl enable certbot.timer
systemctl start certbot.timer

# 7. Test final
echo "🧪 Test des accès HTTPS..."
curl -I https://app.ges-cab.com 2>/dev/null || echo "❌ App non accessible"
curl -I https://api.ges-cab.com 2>/dev/null || echo "❌ API non accessible"
curl -I https://studio.ges-cab.com 2>/dev/null || echo "❌ Studio non accessible"

EOF

echo ""
echo "🎉 HTTPS CONFIGURÉ !"
echo "===================="
echo ""
echo "🔗 Accès sécurisés :"
echo "  • Application : https://app.ges-cab.com"
echo "  • API : https://api.ges-cab.com"
echo "  • Studio : https://studio.ges-cab.com"
echo ""
echo "🔒 Certificats SSL automatiquement renouvelés"
echo ""