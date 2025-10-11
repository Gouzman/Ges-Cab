#!/bin/bash

echo "🔧 Configuration du Studio Supabase avec exposition directe du port..."

# Connexion SSH et configuration
ssh root@82.25.116.122 << 'EOF'

# 1. Arrêter le conteneur studio
echo "🛑 Arrêt du conteneur studio..."
docker stop supabase-studio

# 2. Supprimer le conteneur
docker rm supabase-studio

# 3. Recréer le conteneur avec le port exposé
echo "🚀 Redémarrage du studio avec port exposé..."
docker run -d \
  --name supabase-studio \
  --network supabase_default \
  -p 3001:3000 \
  -e STUDIO_PG_META_URL=http://supabase-meta:8080 \
  -e POSTGRES_PASSWORD=Admin2024!Secure \
  -e PG_META_CRYPTO_KEY=your-crypto-key-here \
  -e DEFAULT_ORGANIZATION_NAME="Ges-Cab" \
  -e DEFAULT_PROJECT_NAME="default" \
  -e NEXT_PUBLIC_SUPABASE_URL=http://api.ges-cab.com \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0 \
  --restart unless-stopped \
  --health-cmd='node -e "fetch(\"http://localhost:3000/api/platform/profile\").then((r) => {if (r.status !== 200) throw new Error(r.status)})"' \
  --health-timeout=10s \
  --health-interval=5s \
  --health-retries=3 \
  supabase/studio:2025.10.01-sha-8460121

# 4. Attendre que le conteneur démarre
echo "⏳ Attente du démarrage du studio..."
sleep 10

# 5. Vérifier l'état
echo "📊 État du studio :"
docker ps | grep studio

# 6. Tester l'accès
echo "🔍 Test d'accès :"
curl -I http://localhost:3001/ 2>/dev/null || echo "Erreur d'accès"

EOF

echo ""
echo "🎉 STUDIO CONFIGURÉ !"
echo "====================="
echo ""
echo "🔗 Accès direct au Studio :"
echo "   http://studio.ges-cab.com"
echo ""
echo "⚠️ Si des erreurs persistent, le studio sera accessible sur :"
echo "   http://82.25.116.122:3001"
echo ""