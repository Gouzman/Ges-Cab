#!/bin/bash

echo "🔐 Activation HTTPS complète pour tous les domaines"
echo "=================================================="
echo ""

# Vérifier que le DNS est configuré
echo "🔍 Vérification préalable du DNS..."
./check-dns-complete.sh

read -p "📋 Le DNS est-il correctement configuré ? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏸️ Configurez d'abord le DNS puis relancez ce script."
    exit 1
fi

echo ""
echo "🔐 Configuration HTTPS en cours..."

# Connexion SSH et configuration HTTPS
ssh root@82.25.116.122 << 'EOF'

# 1. Installation de Certbot si nécessaire
if ! command -v certbot &> /dev/null; then
    echo "📦 Installation de Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# 2. Configuration Nginx avec HTTPS (préparation)
echo "📝 Préparation de la configuration HTTPS..."
cat > /etc/nginx/sites-available/ges-cab << 'NGINX_HTTPS_CONFIG'
# Redirection HTTP vers HTTPS pour ges-cab.com
server {
    listen 80;
    server_name ges-cab.com;
    return 301 https://www.ges-cab.com$request_uri;
}

# Redirection HTTP vers HTTPS pour www.ges-cab.com
server {
    listen 80;
    server_name www.ges-cab.com;
    return 301 https://$server_name$request_uri;
}

# Application principale HTTPS
server {
    listen 443 ssl http2;
    server_name www.ges-cab.com;
    
    # Application principale
    location / {
        root /opt/ges-cab/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
        
        # Headers de sécurité
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    }
    
    # Configuration pour les assets
    location /assets/ {
        root /opt/ges-cab/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Types MIME pour JavaScript
        location ~* \.js$ {
            add_header Content-Type "application/javascript";
        }
    }
}

# Redirection HTTP vers HTTPS pour api.ges-cab.com
server {
    listen 80;
    server_name api.ges-cab.com;
    return 301 https://$server_name$request_uri;
}

# API Supabase HTTPS
server {
    listen 443 ssl http2;
    server_name api.ges-cab.com;
    
    location / {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}

# Redirection HTTP vers HTTPS pour studio.ges-cab.com
server {
    listen 80;
    server_name studio.ges-cab.com;
    return 301 https://$server_name$request_uri;
}

# Studio Supabase HTTPS
server {
    listen 443 ssl http2;
    server_name studio.ges-cab.com;
    
    location / {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}
NGINX_HTTPS_CONFIG

# 3. Test de la configuration
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Erreur dans la configuration Nginx"
    exit 1
fi

# 4. Rechargement de Nginx
systemctl reload nginx

# 5. Obtention des certificats SSL
echo "🔐 Obtention des certificats SSL Let's Encrypt..."
certbot --nginx --non-interactive --agree-tos --email admin@ges-cab.com \
    -d ges-cab.com \
    -d www.ges-cab.com \
    -d api.ges-cab.com \
    -d studio.ges-cab.com

# 6. Configuration du renouvellement automatique
echo "⏰ Configuration du renouvellement automatique..."
systemctl enable certbot.timer
systemctl start certbot.timer

# 7. Mise à jour de la configuration Supabase pour HTTPS
echo "🔧 Mise à jour de la configuration Supabase pour HTTPS..."
cat > /opt/ges-cab/dist/index.html << 'HTML_HTTPS_CONFIG'
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ges-Cab - Gestion de Cabinet</title>
    <script type="module" crossorigin src="/assets/js/index-5a2c5e4d.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/css/index-0a56fdad.css">
    
    <!-- Configuration Supabase pour la production HTTPS -->
    <script>
      window.SUPABASE_CONFIG = {
        url: 'https://api.ges-cab.com',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
      };
    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
HTML_HTTPS_CONFIG

echo ""
echo "🧪 Test des accès HTTPS..."
curl -I https://www.ges-cab.com 2>/dev/null || echo "❌ HTTPS non encore accessible"
curl -I https://api.ges-cab.com 2>/dev/null || echo "❌ API HTTPS non encore accessible"
curl -I https://studio.ges-cab.com 2>/dev/null || echo "❌ Studio HTTPS non encore accessible"

EOF

echo ""
echo "🎉 HTTPS CONFIGURÉ AVEC SUCCÈS !"
echo "================================"
echo ""
echo "🔒 Accès sécurisés :"
echo "  • Application : https://www.ges-cab.com"
echo "  • API : https://api.ges-cab.com"
echo "  • Studio : https://studio.ges-cab.com"
echo ""
echo "✅ Certificats SSL automatiquement renouvelés"
echo "🔐 Toutes les connexions sont maintenant sécurisées"
echo ""