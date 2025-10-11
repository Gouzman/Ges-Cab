#!/bin/bash

echo "👤 Création d'un compte administrateur pour Ges-Cab"
echo "=================================================="
echo ""

# Demander les informations du compte admin
read -p "📧 Adresse email de l'administrateur : " ADMIN_EMAIL
read -s -p "🔒 Mot de passe de l'administrateur : " ADMIN_PASSWORD
echo ""
read -p "👤 Nom de l'administrateur : " ADMIN_NAME

echo ""
echo "🔧 Création du compte administrateur..."

# Connexion SSH et création du compte
ssh root@82.25.116.122 << EOF

# Créer un utilisateur dans la base de données
echo "📝 Insertion dans la base de données..."
docker exec supabase-db psql -U postgres -c "
  INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    created_at, 
    updated_at,
    role,
    aud
  ) VALUES (
    gen_random_uuid(),
    '$ADMIN_EMAIL',
    crypt('$ADMIN_PASSWORD', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ) ON CONFLICT (email) DO NOTHING;
"

# Créer le profil dans profiles
echo "📝 Création du profil administrateur..."
docker exec supabase-db psql -U postgres -c "
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    permissions,
    created_at,
    updated_at
  ) SELECT 
    id,
    '$ADMIN_EMAIL',
    '$ADMIN_NAME',
    'admin',
    '{\"manage_users\": true, \"manage_cases\": true, \"manage_clients\": true, \"manage_tasks\": true, \"manage_documents\": true, \"manage_billing\": true, \"manage_reports\": true, \"manage_calendar\": true, \"manage_team\": true, \"admin_access\": true}',
    NOW(),
    NOW()
  FROM auth.users 
  WHERE email = '$ADMIN_EMAIL'
  ON CONFLICT (email) DO UPDATE SET
    full_name = '$ADMIN_NAME',
    role = 'admin',
    permissions = '{\"manage_users\": true, \"manage_cases\": true, \"manage_clients\": true, \"manage_tasks\": true, \"manage_documents\": true, \"manage_billing\": true, \"manage_reports\": true, \"manage_calendar\": true, \"manage_team\": true, \"admin_access\": true}';
"

echo "✅ Compte administrateur créé avec succès !"

EOF

echo ""
echo "🎉 COMPTE ADMINISTRATEUR CRÉÉ !"
echo "==============================="
echo ""
echo "📧 Email : $ADMIN_EMAIL"
echo "👤 Nom : $ADMIN_NAME"
echo "🔑 Rôle : Administrateur"
echo ""
echo "🔗 Connectez-vous sur : http://82.25.116.122"
echo ""
echo "✅ Votre application Ges-Cab est prête à être utilisée !"
echo ""