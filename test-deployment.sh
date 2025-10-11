#!/bin/bash

echo "🧪 TEST DE DÉPLOIEMENT"
echo "====================="

echo "1. 📦 Build local..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi"
else
    echo "❌ Échec du build"
    exit 1
fi

echo ""
echo "2. 🔍 Vérification des fichiers..."
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo "✅ Fichiers de build présents"
    ls -la dist/
else
    echo "❌ Aucun fichier de build trouvé"
    exit 1
fi

echo ""
echo "3. 🌐 Test de connexion au serveur..."
ssh -o ConnectTimeout=5 root@82.25.116.122 "echo 'Connexion serveur OK'"

if [ $? -eq 0 ]; then
    echo "✅ Connexion serveur réussie"
else
    echo "❌ Impossible de se connecter au serveur"
    echo "Vérifiez votre connexion SSH"
fi

echo ""
echo "🎯 Tout est prêt pour le déploiement automatique !"
echo "Faites un push sur la branche main pour déclencher le déploiement."
