#!/bin/bash

echo "🔧 Configuration de l'application React avec les bonnes URLs Supabase..."

# Connexion SSH et configuration
ssh root@82.25.116.122 << 'EOF'

# 1. Créer la configuration Supabase de production
echo "📝 Configuration des URLs Supabase..."
cat > /opt/ges-cab-config.js << 'SUPABASE_CONFIG'
// Configuration Supabase pour la production
export const SUPABASE_CONFIG = {
  url: 'http://82.25.116.122:8000',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
};
SUPABASE_CONFIG

# 2. Créer un nouveau fichier index.html avec la configuration inline
cat > /opt/ges-cab/dist/index.html << 'HTML_CONFIG'
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ges-Cab - Gestion de Cabinet</title>
    <script type="module" crossorigin src="/assets/index.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index.css">
    
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
HTML_CONFIG

echo "✅ Configuration mise à jour"

# 3. Test d'accès à l'application
echo "🧪 Test d'accès à l'application :"
curl -I http://localhost/ | head -1

# 4. Test d'accès à l'API Supabase
echo "🧪 Test d'accès à l'API Supabase :"
curl -I http://localhost:8000/ | head -1

EOF

echo ""
echo "🎉 CONFIGURATION MISE À JOUR !"
echo "=============================="
echo ""
echo "🔗 Votre application utilise maintenant :"
echo "  • URL Supabase : http://82.25.116.122:8000"
echo "  • Clé Anon : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo ""
echo "📱 Testez maintenant : http://82.25.116.122"
echo ""
echo "⚠️ Note : L'application devrait maintenant se connecter correctement"
echo "         à votre instance Supabase auto-hébergée"
echo ""