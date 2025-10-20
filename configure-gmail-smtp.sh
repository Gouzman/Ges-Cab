#!/bin/bash

# 📧 Configuration SMTP Gmail pour Ges-Cab
# Ce script aide à configurer l'envoi de vrais emails via Gmail

echo "🔧 Configuration SMTP Gmail pour Ges-Cab"
echo "======================================"
echo ""

# Vérifier si les variables sont définies
if [ -f ".env.local" ]; then
    echo "✅ Fichier .env.local trouvé"
else
    echo "❌ Fichier .env.local non trouvé"
    exit 1
fi

echo ""
echo "📋 Instructions pour configurer Gmail SMTP :"
echo ""
echo "1️⃣  Aller sur https://myaccount.google.com/security"
echo "2️⃣  Activer l'authentification à 2 facteurs"
echo "3️⃣  Générer un 'Mot de passe d'application' :"
echo "    - Sélectionner 'Autre (nom personnalisé)'"
echo "    - Nommer : 'Ges-Cab Local Dev'"
echo "    - Copier le mot de passe généré (16 caractères)"
echo ""
echo "4️⃣  Modifier le fichier .env.local avec vos informations :"
echo ""

# Lire les variables actuelles
current_email=$(grep "SMTP_EMAIL=" .env.local | cut -d'=' -f2)
current_password=$(grep "SMTP_PASSWORD=" .env.local | cut -d'=' -f2)

echo "Variables actuelles dans .env.local :"
echo "SMTP_EMAIL=$current_email"
echo "SMTP_PASSWORD=$current_password"
echo ""

# Proposer la modification interactive
read -p "🔧 Voulez-vous modifier ces informations maintenant ? (y/n): " modify

if [ "$modify" = "y" ] || [ "$modify" = "Y" ]; then
    echo ""
    read -p "📧 Entrez votre adresse Gmail (ex: elie.gouzou@gmail.com): " email
    read -p "🔑 Entrez votre mot de passe d'application Gmail (16 caractères): " password
    
    # Sauvegarder l'ancien fichier
    cp .env.local .env.local.backup
    echo "💾 Sauvegarde créée : .env.local.backup"
    
    # Modifier les variables
    sed -i.tmp "s/SMTP_EMAIL=.*/SMTP_EMAIL=$email/" .env.local
    sed -i.tmp "s/SMTP_PASSWORD=.*/SMTP_PASSWORD=$password/" .env.local
    sed -i.tmp "s/ADMIN_EMAIL=.*/ADMIN_EMAIL=$email/" .env.local
    rm .env.local.tmp
    
    echo ""
    echo "✅ Configuration mise à jour !"
    echo "📧 Email: $email"
    echo "🔑 Mot de passe: *********************"
    echo ""
fi

echo "5️⃣  Redémarrer Supabase pour prendre en compte la nouvelle configuration :"
echo "    supabase stop && supabase start"
echo ""
echo "6️⃣  Tester l'envoi d'email depuis l'application"
echo ""

# Vérifier la configuration Supabase
if supabase status > /dev/null 2>&1; then
    echo "✅ Supabase est démarré"
    
    read -p "🔄 Voulez-vous redémarrer Supabase maintenant pour appliquer la config SMTP ? (y/n): " restart
    
    if [ "$restart" = "y" ] || [ "$restart" = "Y" ]; then
        echo "🔄 Redémarrage de Supabase..."
        supabase stop
        echo "⏳ Attente de l'arrêt complet..."
        sleep 3
        supabase start
        
        if [ $? -eq 0 ]; then
            echo "✅ Supabase redémarré avec succès !"
            echo "📧 Les emails seront maintenant envoyés via Gmail SMTP"
        else
            echo "❌ Erreur lors du redémarrage de Supabase"
        fi
    fi
else
    echo "⚠️  Supabase n'est pas démarré. Démarrez-le avec : supabase start"
fi

echo ""
echo "🎉 Configuration terminée !"
echo "   Les emails de réinitialisation seront maintenant envoyés"
echo "   directement à l'adresse Gmail configurée."
echo ""
echo "📋 Test : npm run dev → Mot de passe oublié → Vérifiez votre Gmail"