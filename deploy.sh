#!/bin/bash
# Script de déploiement automatisé pour Ges-Cab
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

# Configuration
SERVER="root@82.25.116.122"
REMOTE_PATH="/opt/ges-cab/dist/"
LOCAL_PATH="dist/"

echo "🚀 Démarrage du déploiement de Ges-Cab..."

# Étape 1: Construction de l'application
echo "📦 Construction de l'application..."
npm run build

# Étape 2: Génération de la documentation
echo "📝 Génération du fichier llms.txt..."
node tools/generate-llms.js

# Étape 3: Vérification des fichiers construits
echo "✅ Vérification des fichiers construits..."
if [ ! -d "$LOCAL_PATH" ]; then
    echo "❌ Erreur: Le dossier dist/ n'existe pas"
    exit 1
fi

if [ ! -f "${LOCAL_PATH}index.html" ]; then
    echo "❌ Erreur: Le fichier index.html n'existe pas"
    exit 1
fi

# Étape 4: Sauvegarde de l'ancienne version (optionnel)
echo "💾 Sauvegarde de l'ancienne version..."
ssh $SERVER "cp -r $REMOTE_PATH ${REMOTE_PATH%/}_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || true"

# Étape 5: Déploiement
echo "🚚 Déploiement vers le serveur..."
rsync -avz --delete $LOCAL_PATH $SERVER:$REMOTE_PATH

# Étape 6: Vérification du serveur web
echo "🔧 Rechargement de nginx..."
ssh $SERVER "systemctl reload nginx"

# Étape 7: Test de connectivité
echo "🌐 Test de l'application..."
if curl -s -o /dev/null -w "%{http_code}" http://82.25.116.122 | grep -q "200"; then
    echo "✅ Déploiement réussi !"
    echo "🎉 L'application est accessible sur : http://82.25.116.122"
else
    echo "⚠️  Attention: L'application ne répond pas correctement"
    echo "Vérifiez manuellement : http://82.25.116.122"
fi

# Étape 8: Affichage des informations de déploiement
echo ""
echo "📊 Informations de déploiement :"
echo "   Date : $(date)"
echo "   Version construite : $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
echo "   Taille du déploiement : $(du -sh $LOCAL_PATH | cut -f1)"

echo ""
echo "🎯 Fonctionnalités déployées dans cette version :"
echo "   ✅ Système d'authentification corrigé (suppression password_hash)"
echo "   ✅ Fonctionnalité 'Mot de passe oublié' complète"
echo "   ✅ Écrans ForgotPasswordScreen et ResetPasswordScreen"
echo "   ✅ Intégration Supabase Auth native"
echo "   ✅ Inscription contrôlée par l'administrateur maintenue"

echo ""
echo "🔗 URLs importantes :"
echo "   • Application principale : http://82.25.116.122"
echo "   • Mot de passe oublié : http://82.25.116.122/forgot-password"
echo "   • Dashboard Supabase : https://supabase.com/dashboard"

echo ""
echo "✨ Déploiement terminé avec succès !"