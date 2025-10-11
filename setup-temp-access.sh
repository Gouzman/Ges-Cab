#!/bin/bash

echo "🔧 Configuration temporaire avec accès IP et préparation HTTPS..."

ssh root@82.25.116.122 << 'EOF'

# 1. Créer une configuration temporaire pour accès par IP
echo "📝 Configuration temporaire Nginx..."
cat > /etc/nginx/sites-available/ges-cab-temp << 'NGINX_CONFIG'
# Configuration temporaire avec accès par IP
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name 82.25.116.122;
    
    # Application principale
    location / {
        root /opt/ges-cab/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
        
        # Headers pour SPA
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}

# Configuration pour API sur port 8001
server {
    listen 8001;
    server_name 82.25.116.122;
    
    # API Supabase via Kong
    location / {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Configuration pour Studio sur port 8002
server {
    listen 8002;
    server_name 82.25.116.122;
    
    # Studio Supabase
    location / {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Configuration prête pour les domaines (HTTPS)
server {
    listen 80;
    server_name app.ges-cab.com;
    
    # Application principale
    location / {
        root /opt/ges-cab/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
}

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
    }
}

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
    }
}
NGINX_CONFIG

# 2. Activer la nouvelle configuration
rm -f /etc/nginx/sites-enabled/ges-cab
ln -sf /etc/nginx/sites-available/ges-cab-temp /etc/nginx/sites-enabled/

# 3. Test et rechargement
nginx -t && systemctl reload nginx

# 4. Test des accès
echo "🧪 Test des accès temporaires :"
echo "Application : http://82.25.116.122"
curl -I http://localhost/ | head -1
echo "API : http://82.25.116.122:8001"
curl -I http://localhost:8001/ | head -1  
echo "Studio : http://82.25.116.122:8002"
curl -I http://localhost:8002/ | head -1

EOF

echo ""
echo "🎉 CONFIGURATION TEMPORAIRE ACTIVE !"
echo "===================================="
echo ""
echo "📱 Accès temporaires (en attendant DNS) :"
echo "  • Application : http://82.25.116.122"
echo "  • API : http://82.25.116.122:8001"
echo "  • Studio : http://82.25.116.122:8002"
echo ""
echo "⚠️ Prochaines étapes :"
echo "1. Configurer les enregistrements DNS A pour :"
echo "   - app.ges-cab.com -> 82.25.116.122"
echo "   - api.ges-cab.com -> 82.25.116.122"
echo "   - studio.ges-cab.com -> 82.25.116.122"
echo ""
echo "2. Une fois le DNS propagé, lancer :"
echo "   certbot --nginx -d app.ges-cab.com -d api.ges-cab.com -d studio.ges-cab.com"
echo ""