#!/bin/bash

echo "🔧 Correction de la structure des assets et de l'HTML..."

ssh root@82.25.116.122 << 'EOF'

cd /opt/ges-cab/dist

# 1. Identifier les vrais noms des fichiers
echo "📁 Fichiers JavaScript trouvés :"
find assets -name "*.js" -type f

echo ""
echo "📁 Fichiers CSS trouvés :"
find assets -name "*.css" -type f

# 2. Trouver le fichier JS principal (le plus gros, probablement index)
MAIN_JS=$(find assets -name "index-*.js" -type f | head -1)
MAIN_CSS=$(find assets -name "index-*.css" -type f | head -1)

echo ""
echo "🎯 Fichier JS principal : $MAIN_JS"
echo "🎯 Fichier CSS principal : $MAIN_CSS"

# 3. Créer le bon index.html avec les vrais chemins
cat > index.html << HTML_END
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ges-Cab - Gestion de Cabinet</title>
    <script type="module" crossorigin src="/$MAIN_JS"></script>
    <link rel="stylesheet" crossorigin href="/$MAIN_CSS">
    
    <!-- Configuration Supabase pour la production -->
    <script>
      window.SUPABASE_CONFIG = {
        url: 'http://82.25.116.122:8000',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
      };
    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
HTML_END

# 4. Vérifier la configuration Nginx pour les types MIME
echo ""
echo "🔧 Vérification de la configuration Nginx pour les types MIME..."

# 5. Ajouter la configuration MIME si nécessaire
if ! grep -q "application/javascript" /etc/nginx/mime.types; then
    echo "⚠️ Ajout des types MIME JavaScript..."
    # Sauvegarde
    cp /etc/nginx/mime.types /etc/nginx/mime.types.backup
    
    # Ajouter les types MIME nécessaires
    sed -i '/text\/css/a\    application\/javascript                          js;' /etc/nginx/mime.types
    sed -i '/application\/javascript/a\    text\/javascript                              js;' /etc/nginx/mime.types
fi

# 6. Recharger Nginx
nginx -t && systemctl reload nginx

echo ""
echo "✅ Correction terminée !"
echo "🌐 Test de l'application..."
curl -I http://localhost/ | head -1

EOF

echo ""
echo "🎉 CORRECTION APPLIQUÉE !"
echo "========================"
echo ""
echo "🔗 Testez maintenant : http://82.25.116.122"
echo ""