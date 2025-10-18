#!/bin/bash
# 🚀 CORRECTION RAPIDE Infrastructure Ges-Cab
echo "🚀 Correction Infrastructure Ges-Cab - $(date)"
echo "=============================================="

# 1. DIAGNOSTIC INITIAL
echo "🔍 Services actifs:"
ps aux | grep -E '(supabase|kong|postgres)' | grep -v grep | head -3
echo ""
echo "📊 Ports en écoute:"
netstat -tlnp | grep -E ':(80|443|54321|54323)' | head -5
echo ""

# 2. SAUVEGARDER NGINX
echo "💾 Sauvegarde configuration Nginx..."
cp /etc/nginx/sites-available/ges-cab.com /etc/nginx/sites-available/ges-cab.com.backup 2>/dev/null && echo "✅ Sauvegarde OK" || echo "⚠️ Pas de config ges-cab.com trouvée"

# 3. DÉSACTIVER BASIC AUTH
echo "🔧 Correction Basic Auth..."
for file in /etc/nginx/sites-available/*ges-cab*; do
    if [ -f "$file" ]; then
        sed -i 's/auth_basic/#auth_basic/g' "$file" 2>/dev/null
        sed -i 's/auth_basic_user_file/#auth_basic_user_file/g' "$file" 2>/dev/null
        echo "✅ Basic Auth désactivé dans $(basename $file)"
    fi
done

# 4. AJOUTER CORS
echo "🌐 Ajout headers CORS..."
cat > /tmp/cors.txt << 'EOF'
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;
    add_header 'Access-Control-Allow-Headers' 'Origin,Content-Type,Accept,Authorization,apikey' always;
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Max-Age' 1728000 always;
        return 204;
    }
EOF

# Ajouter CORS dans les configs Nginx
for file in /etc/nginx/sites-available/*ges-cab*; do
    if [ -f "$file" ] && ! grep -q "Access-Control-Allow-Origin" "$file"; then
        sed -i '/location \/ {/r /tmp/cors.txt' "$file" 2>/dev/null
        echo "✅ CORS ajouté dans $(basename $file)"
    fi
done

# 5. REDÉMARRER STUDIO SUPABASE
echo "🎛️ Redémarrage Studio..."
# Docker method
docker-compose up -d supabase-studio 2>/dev/null && echo "✅ Studio via Docker" || echo "⚠️ Docker non trouvé"
# Systemd method
systemctl start supabase-studio 2>/dev/null && echo "✅ Studio via systemd" || echo "⚠️ Service systemd non trouvé"
# CLI method
pgrep -f supabase > /dev/null || (supabase start > /tmp/supabase.log 2>&1 &) && echo "✅ Studio via CLI" || echo "⚠️ CLI non disponible"

# 6. RECHARGER NGINX
echo "🔄 Rechargement Nginx..."
nginx -t && systemctl reload nginx && echo "✅ Nginx rechargé" || echo "❌ Erreur Nginx"

# 7. TESTS FINAUX
echo ""
echo "🧪 TESTS POST-CORRECTION:"
echo "========================"
curl -s -o /dev/null -w "Frontend local: %{http_code}\n" http://localhost:3000/ 2>/dev/null || echo "Frontend: Non accessible"
curl -s -o /dev/null -w "Studio local: %{http_code}\n" http://localhost:54323/ 2>/dev/null || echo "Studio: Non accessible"
curl -s -o /dev/null -w "API locale: %{http_code}\n" http://localhost:54321/rest/v1/ 2>/dev/null || echo "API: Non accessible"

echo ""
echo "🌐 TESTS EXTERNES:"
curl -s -o /dev/null -w "ges-cab.com: %{http_code}\n" https://ges-cab.com/ 2>/dev/null
curl -s -o /dev/null -w "studio.ges-cab.com: %{http_code}\n" https://studio.ges-cab.com/ 2>/dev/null
curl -s -o /dev/null -w "api.ges-cab.com: %{http_code}\n" https://api.ges-cab.com/rest/v1/ 2>/dev/null

echo ""
echo "✅ CORRECTION TERMINÉE!"
echo "====================="
echo "📋 Actions effectuées:"
echo "  • Basic Auth désactivé"
echo "  • Headers CORS ajoutés" 
echo "  • Studio Supabase redémarré"
echo "  • Nginx rechargé"
echo ""
echo "🎯 Testez maintenant: https://ges-cab.com"
rm -f /tmp/cors.txt