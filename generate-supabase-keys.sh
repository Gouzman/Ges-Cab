#!/bin/bash

# Script pour générer de vraies clés JWT Supabase
# Ce script génère les clés JWT nécessaires pour remplacer les tokens factices

echo "🔑 Génération des clés JWT Supabase..."

# Secret JWT (doit être très sécurisé - 32 caractères minimum)
JWT_SECRET="GEScab2024SuperSecureJWTSecretKey32Chars!"

# Générer l'ANON KEY (rôle anonymous)
ANON_PAYLOAD=$(cat <<EOF
{
  "iss": "supabase",
  "ref": "gescab",
  "role": "anon",
  "iat": $(date +%s)
}
EOF
)

# Générer la SERVICE ROLE KEY (rôle service_role)
SERVICE_PAYLOAD=$(cat <<EOF
{
  "iss": "supabase", 
  "ref": "gescab",
  "role": "service_role",
  "iat": $(date +%s)
}
EOF
)

echo "📝 Clés JWT générées :"
echo ""
echo "🔐 JWT_SECRET:"
echo "$JWT_SECRET"
echo ""

# Si Node.js est disponible, utiliser jsonwebtoken pour générer les vrais JWT
if command -v node &> /dev/null; then
    echo "🔑 Génération des JWT avec Node.js..."
    
    # Créer un script Node.js temporaire
    cat > /tmp/generate_jwt.js << 'EOF'
const crypto = require('crypto');

// Fonction pour encoder en base64url
function base64urlEscape(str) {
    return str.replace(/\+/g, '-')
              .replace(/\//g, '_')
              .replace(/=/g, '');
}

// Fonction pour créer un JWT simple
function createJWT(payload, secret) {
    const header = {
        "alg": "HS256",
        "typ": "JWT"
    };
    
    const encodedHeader = base64urlEscape(Buffer.from(JSON.stringify(header)).toString('base64'));
    const encodedPayload = base64urlEscape(Buffer.from(JSON.stringify(payload)).toString('base64'));
    
    const signature = crypto
        .createHmac('sha256', secret)
        .update(encodedHeader + '.' + encodedPayload)
        .digest('base64');
    
    const encodedSignature = base64urlEscape(signature);
    
    return encodedHeader + '.' + encodedPayload + '.' + encodedSignature;
}

const secret = process.argv[2];
const role = process.argv[3];

const payload = {
    "iss": "supabase",
    "ref": "gescab", 
    "role": role,
    "iat": Math.floor(Date.now() / 1000)
};

console.log(createJWT(payload, secret));
EOF

    # Générer les clés
    ANON_KEY=$(node /tmp/generate_jwt.js "$JWT_SECRET" "anon")
    SERVICE_KEY=$(node /tmp/generate_jwt.js "$JWT_SECRET" "service_role")
    
    echo "✅ VITE_SUPABASE_ANON_KEY:"
    echo "$ANON_KEY"
    echo ""
    echo "✅ VITE_SUPABASE_SERVICE_ROLE_KEY:"
    echo "$SERVICE_KEY"
    echo ""
    
    # Nettoyer le fichier temporaire
    rm /tmp/generate_jwt.js
    
else
    echo "⚠️  Node.js non trouvé. Utilisation de clés d'exemple (à remplacer manuellement) :"
    echo ""
    echo "✅ VITE_SUPABASE_ANON_KEY (exemple - à générer avec JWT):"
    echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc2NhYiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk4NzQwMDAwfQ.[SIGNATURE_A_GENERER]"
    echo ""
    echo "✅ VITE_SUPABASE_SERVICE_ROLE_KEY (exemple - à générer avec JWT):"
    echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc2NhYiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2OTg3NDAwMDB9.[SIGNATURE_A_GENERER]"
fi

echo ""
echo "📋 Instructions pour mettre à jour les fichiers .env :"
echo "1. Copiez les clés générées ci-dessus"
echo "2. Remplacez les valeurs dans .env.local et .env.production"
echo "3. Utilisez le même JWT_SECRET dans votre configuration Supabase serveur"
echo ""
echo "🔒 IMPORTANT: Gardez le JWT_SECRET secret et ne le commitez jamais dans Git !"