#!/bin/bash

echo "🔧 Correction de la configuration Nginx pour Supabase Studio..."

# Connexion SSH et correction de la configuration
ssh root@82.25.116.122 << 'EOF'
# Sauvegarde de la configuration actuelle
cp /etc/nginx/sites-available/ges-cab /etc/nginx/sites-available/ges-cab.backup

# Nouvelle configuration corrigée
cat > /etc/nginx/sites-available/ges-cab << 'NGINX_CONFIG'
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
    
    # Studio Supabase via Kong
    location / {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_CONFIG

# Test de la configuration
nginx -t

if [ $? -eq 0 ]; then
    # Rechargement de Nginx
    systemctl reload nginx
    echo "✅ Configuration Nginx mise à jour et rechargée"
else
    echo "❌ Erreur dans la configuration Nginx"
    # Restauration de la sauvegarde
    cp /etc/nginx/sites-available/ges-cab.backup /etc/nginx/sites-available/ges-cab
    exit 1
fi

# Vérification de l'état des services
echo "📊 État des services :"
systemctl status nginx --no-pager -l
echo ""
echo "🐳 Conteneurs Docker :"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep supabase

EOF

echo ""
echo "🎉 CORRECTION TERMINÉE !"
echo "========================="
echo ""
echo "🔗 Testez maintenant :"
echo "  • Application : http://app.ges-cab.com"
echo "  • API : http://api.ges-cab.com"
echo "  • Studio : http://studio.ges-cab.com"
echo ""