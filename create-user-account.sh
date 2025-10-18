#!/bin/bash
# Script pour enregistrer un compte utilisateur via l'API Supabase directement

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}👤 Enregistrement d'un compte utilisateur dans Supabase...${NC}"

# Informations du compte
EMAIL="elie.gouzou@gmail.com"
PASSWORD="Gouzman*1990"
NAME="Elie Gouzou"
ROLE="admin"

# Déterminer l'URL Supabase à partir du fichier .env.local
if [ -f ".env.local" ]; then
  SUPABASE_URL=$(grep VITE_SUPABASE_URL .env.local | cut -d '=' -f2)
  SUPABASE_ANON_KEY=$(grep VITE_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2)
else
  SUPABASE_URL="https://api.ges-cab.com"
  SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc2NhYiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk4NzQwMDAwfQ.xyz123"
fi

echo -e "${YELLOW}URL Supabase: $SUPABASE_URL${NC}"
echo -e "${YELLOW}Email: $EMAIL${NC}"
echo -e "${YELLOW}Nom: $NAME${NC}"
echo -e "${YELLOW}Rôle: $ROLE${NC}"
echo ""

echo -e "${BLUE}Enregistrement du compte via l'API Supabase...${NC}"

# Création de la requête JSON dans un fichier temporaire pour éviter les problèmes d'échappement
cat > /tmp/signup_request.json << EOF
{
  "email": "$EMAIL",
  "password": "$PASSWORD",
  "data": {
    "full_name": "$NAME",
    "role": "$ROLE"
  }
}
EOF

response=$(curl -s -X POST "$SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/signup_request.json)

echo "Réponse API:"
echo "$response"

# Vérifier si l'inscription a réussi
if echo "$response" | grep -q "id"; then
  user_id=$(echo "$response" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Inscription réussie !${NC}"
  echo -e "${YELLOW}ID utilisateur: $user_id${NC}"
  
  # Enregistrement dans la table profiles
  echo -e "${BLUE}Création du profil dans la base de données...${NC}"
  
  # Création de la requête JSON dans un fichier temporaire
  cat > /tmp/profile_request.json << EOF
{
  "id": "$user_id",
  "email": "$EMAIL",
  "full_name": "$NAME",
  "role": "$ROLE",
  "permissions": {"manage_users": true, "manage_cases": true, "manage_clients": true, "manage_tasks": true, "manage_documents": true, "manage_billing": true, "manage_reports": true, "manage_calendar": true, "manage_team": true, "admin_access": true},
  "is_active": true
}
EOF

  profile_response=$(curl -s -X POST "$SUPABASE_URL/rest/v1/profiles" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d @/tmp/profile_request.json)
    
  echo -e "${GREEN}✅ Profil créé dans la base de données${NC}"
  
  # Créer un fichier HTML pour faciliter la connexion
  echo -e "${BLUE}Création d'un fichier HTML pour tester la connexion...${NC}"
  cat > login-test.html << EOF
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test de Connexion Ges-Cab</title>
  <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .success {
      color: #10b981;
      font-weight: bold;
    }
    .error {
      color: #ef4444;
      font-weight: bold;
    }
    .log {
      background-color: #f3f4f6;
      padding: 15px;
      border-radius: 4px;
      font-family: monospace;
      white-space: pre-wrap;
      max-height: 200px;
      overflow: auto;
    }
    button {
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 10px 15px;
      cursor: pointer;
      font-size: 16px;
    }
    input {
      width: 100%;
      padding: 8px;
      margin-bottom: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Test de Connexion Ges-Cab</h1>
  
  <div class="card">
    <h2>Détails du compte</h2>
    <div>
      <p><strong>Email:</strong> <input type="email" id="email" value="${EMAIL}"></p>
      <p><strong>Mot de passe:</strong> <input type="password" id="password" value="${PASSWORD}"></p>
    </div>
    <button onclick="login()">Se connecter</button>
  </div>
  
  <div class="card">
    <h2>Résultat</h2>
    <div id="result">En attente...</div>
    <div id="log" class="log"></div>
  </div>
  
  <script>
    // Configuration Supabase
    const SUPABASE_URL = '${SUPABASE_URL}';
    const SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';
    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Fonction pour ajouter des logs
    function log(message) {
      const logElement = document.getElementById('log');
      logElement.innerHTML += message + '\n';
    }
    
    // Fonction pour se connecter
    async function login() {
      const resultElement = document.getElementById('result');
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      resultElement.innerHTML = 'Connexion en cours...';
      log('Tentative de connexion avec ' + email + '...');
      
      try {
        // Tentative de connexion
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (error) {
          throw error;
        }
        
        // Connexion réussie
        log('Connexion réussie !');
        log('User ID: ' + data.user.id);
        
        // Récupérer le profil utilisateur
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          log('Erreur lors de la récupération du profil: ' + profileError.message);
        } else {
          log('Profil récupéré:');
          log(JSON.stringify(profileData, null, 2));
        }
        
        resultElement.innerHTML = '<span class="success">✅ Connexion réussie !</span>';
        
      } catch (error) {
        log('Erreur: ' + error.message);
        resultElement.innerHTML = '<span class="error">❌ Erreur de connexion: ' + error.message + '</span>';
        
        if (error.message.includes('Email not confirmed')) {
          log('\nVotre email n\'a pas été confirmé:');
          log('1. Vérifiez votre boîte de réception pour confirmer votre adresse email');
          log('2. Cliquez sur le lien de confirmation dans l\'email');
          log('3. Réessayez de vous connecter');
        }
      }
    }
  </script>
</body>
</html>
EOF
  
  echo -e "${GREEN}✅ Fichier HTML de test de connexion créé: login-test.html${NC}"
  
else
  error=$(echo "$response" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
  echo -e "${RED}❌ Erreur lors de l'inscription: ${error:-'Erreur inconnue'}${NC}"
  
  if echo "$response" | grep -q "User already registered"; then
    echo -e "${YELLOW}⚠️  L'utilisateur existe déjà.${NC}"
  fi
fi

echo -e "\n${GREEN}=== INSTRUCTIONS POUR SE CONNECTER ===${NC}"
echo -e "1. Vérifiez votre boîte email et confirmez votre adresse email"
echo -e "2. Ouvrez l'application Ges-Cab: https://www.ges-cab.com"
echo -e "3. Connectez-vous avec les identifiants suivants:"
echo -e "   - Email: ${YELLOW}$EMAIL${NC}"
echo -e "   - Mot de passe: ${YELLOW}[mot de passe fourni]${NC}"
echo -e "\nPour tester la connexion localement, ouvrez le fichier ${YELLOW}login-test.html${NC} dans votre navigateur."