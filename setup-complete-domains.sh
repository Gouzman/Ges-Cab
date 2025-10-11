#!/bin/bash

echo "🌐 Configuration complète des domaines avec HTTPS"
echo "================================================="
echo ""

# Connexion SSH et configuration complète
ssh root@82.25.116.122 << 'EOF'

# 1. Configuration Nginx complète avec tous les domaines
echo "📝 Configuration Nginx avec tous les domaines..."
cat > /etc/nginx/sites-available/ges-cab << 'NGINX_CONFIG'
# Redirection de ges-cab.com vers www.ges-cab.com
server {
    listen 80;
    server_name ges-cab.com;
    return 301 http://www.ges-cab.com$request_uri;
}

# Application principale sur www.ges-cab.com
server {
    listen 80;
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

# API Supabase sur api.ges-cab.com
server {
    listen 80;
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
}

# Studio Supabase sur studio.ges-cab.com
server {
    listen 80;
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
}
NGINX_CONFIG

# 2. Test de la configuration
echo "🧪 Test de la configuration Nginx..."
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Erreur dans la configuration Nginx"
    exit 1
fi

# 3. Rechargement de Nginx
echo "🔄 Rechargement de Nginx..."
systemctl reload nginx

# 4. Mise à jour de la configuration Supabase dans l'application
echo "🔧 Mise à jour de la configuration Supabase..."
cat > /opt/ges-cab/dist/index.html << 'HTML_CONFIG'
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ges-Cab - Gestion de Cabinet</title>
    <script type="module" crossorigin src="/assets/js/index-5a2c5e4d.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/css/index-0a56fdad.css">
    
    <!-- Configuration Supabase pour la production -->
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
HTML_CONFIG

echo "✅ Configuration mise à jour !"

# 5. Test des accès
echo ""
echo "🧪 Test des accès HTTP :"
curl -I http://localhost/ | head -1

EOF

echo ""
echo "🎉 CONFIGURATION DOMAINES TERMINÉE !"
echo "===================================="
echo ""
echo "📋 ÉTAPES SUIVANTES :"
echo ""
echo "1️⃣ **Configurez ces enregistrements DNS :**"
echo "   Type A : ges-cab.com        → 82.25.116.122"
echo "   Type A : www.ges-cab.com    → 82.25.116.122"
echo "   Type A : api.ges-cab.com    → 82.25.116.122"
echo "   Type A : studio.ges-cab.com → 82.25.116.122"
echo ""
echo "2️⃣ **Une fois le DNS propagé, activez HTTPS :**"
echo "   ./enable-https-complete.sh"
echo ""
echo "3️⃣ **Vérifiez la propagation DNS :**"
echo "   ./check-dns-complete.sh"
echo ""