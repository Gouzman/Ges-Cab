#!/bin/bash
echo "🚀 === ANALYSE AUTOMATIQUE DU BACKEND (Ges-Cab) ==="

# Étape 1 - Vérifie si le port 3003 est déjà occupé
echo "🔎 Vérification du port 3003..."
if lsof -i :3003 >/dev/null 2>&1; then
  echo "⚠️  Le port 3003 est déjà occupé. Voici le processus :"
  lsof -i :3003
  echo "➡️  Tu peux le libérer avec : kill -9 <PID>"
else
  echo "✅ Le port 3003 est libre."
fi

# Étape 2 - Vérifie les variables d'environnement
echo ""
echo "🔎 Vérification des variables .env.local..."
if [ -f ".env.local" ]; then
  grep -E "VITE_API_URL|SUPABASE_URL|SUPABASE_ANON_KEY" .env.local
else
  echo "⚠️  Fichier .env.local manquant !"
fi

# Étape 3 - Vérifie si un backend Node/Express existe
echo ""
echo "🔎 Recherche d'un serveur backend..."
SERVER_FILE=$(grep -ril "app.listen" . | grep -E "server|index|api|main")
if [ -n "$SERVER_FILE" ]; then
  echo "✅ Serveur trouvé : $SERVER_FILE"
else
  echo "❌ Aucun serveur Express/Node détecté dans ton projet."
  echo "➡️  Si tu relies directement Supabase, change ton .env.local :"
  echo "VITE_API_URL=https://gesadminsystem.supabase.co"
fi

# Étape 4 - Vérifie les dépendances backend importantes
echo ""
echo "🔍 Vérification des dépendances critiques..."
REQUIRED=("express" "cors" "dotenv" "@supabase/supabase-js")
for pkg in "${REQUIRED[@]}"; do
  npm list "$pkg" >/dev/null 2>&1 || echo "⚠️  $pkg manquant"
done

# Étape 5 - Teste la connexion Supabase
echo ""
echo "🔌 Test de connexion Supabase..."
node -e "
import('dotenv/config');
import { createClient } from '@supabase/supabase-js';
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) { console.error('❌ Variables Supabase manquantes'); process.exit(1); }
const supabase = createClient(url, key);
supabase.from('users').select('*', { count: 'exact' }).then(r => {
  if (r.error) console.error('❌ Erreur Supabase:', r.error.message);
  else console.log('✅ Connexion Supabase réussie,', r.count, 'utilisateurs détectés');
});
" 2>/dev/null

# Étape 6 - Vérifie le proxy CORS
echo ""
echo "🧠 Vérification du proxy CORS..."
if grep -q "CORS_PROXY_URL" src/lib/corsProxy.js; then
  echo "✅ Proxy CORS détecté dans src/lib/corsProxy.js"
else
  echo "⚠️  Aucun proxy CORS détecté — attention aux erreurs navigateur (Failed to fetch)"
fi

# Étape 7 - Lancement du serveur backend si trouvé
echo ""
echo "🚀 Sélection du backend principal..."
if [ -f "./backend/api-server.js" ]; then
  SERVER_TO_RUN="./backend/api-server.js"
elif [ -f "./backend/server.js" ]; then
  SERVER_TO_RUN="./backend/server.js"
else
  echo "❌ Aucun fichier backend trouvé (ni server.js ni api-server.js)"
  exit 1
fi

echo "➡️  Démarrage de $SERVER_TO_RUN ..."
node "$SERVER_TO_RUN" &
sleep 3
if curl -Is http://localhost:3003/api/auth/signin | grep -q "200"; then
  echo "✅ Backend accessible sur http://localhost:3003"
else
  echo "❌ Backend non accessible sur http://localhost:3003"
fi

echo ""
echo "🎯 ANALYSE TERMINÉE."
echo "👉 Si tout est vert, relance ton front avec : npm run dev"

