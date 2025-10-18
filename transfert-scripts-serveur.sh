#!/bin/bash

# Script pour transférer les fichiers de correction sur le serveur
echo "📤 TRANSFERT DES SCRIPTS DE CORRECTION"
echo "======================================"

SERVER="root@82.25.116.122"
LOCAL_PATH="/Users/gouzman/Documents/Ges-Cab"

echo "Serveur cible : $SERVER"
echo "Répertoire local : $LOCAL_PATH"
echo ""

# Vérifier la connectivité SSH
echo "🔍 Test de connectivité SSH..."
if timeout 10 ssh -o ConnectTimeout=5 $SERVER "echo 'SSH OK'" 2>/dev/null; then
    echo "✅ Connexion SSH fonctionnelle"
    
    echo ""
    echo "📤 Transfert des fichiers..."
    
    # Transférer le script de correction automatique
    scp "$LOCAL_PATH/fix-infrastructure-serveur.sh" $SERVER:/tmp/
    if [ $? -eq 0 ]; then
        echo "✅ fix-infrastructure-serveur.sh transféré"
    else
        echo "❌ Échec transfert fix-infrastructure-serveur.sh"
    fi
    
    # Transférer le guide manuel
    scp "$LOCAL_PATH/GUIDE-CORRECTION-MANUELLE.md" $SERVER:/tmp/
    if [ $? -eq 0 ]; then
        echo "✅ GUIDE-CORRECTION-MANUELLE.md transféré"
    else
        echo "❌ Échec transfert guide manuel"
    fi
    
    echo ""
    echo "🚀 EXÉCUTION SUR LE SERVEUR"
    echo "==========================="
    echo ""
    echo "Commandes à exécuter sur le serveur :"
    echo ""
    echo "ssh $SERVER"
    echo "chmod +x /tmp/fix-infrastructure-serveur.sh"
    echo "/tmp/fix-infrastructure-serveur.sh"
    echo ""
    echo "Ou pour la correction manuelle :"
    echo "cat /tmp/GUIDE-CORRECTION-MANUELLE.md"
    
else
    echo "❌ Connexion SSH échouée"
    echo ""
    echo "💡 SOLUTIONS ALTERNATIVES :"
    echo "=========================="
    echo ""
    echo "1. Connectez-vous manuellement :"
    echo "   ssh $SERVER"
    echo ""
    echo "2. Copiez le contenu du script :"
    echo "   cat $LOCAL_PATH/fix-infrastructure-serveur.sh"
    echo ""
    echo "3. Créez le fichier sur le serveur :"
    echo "   nano /tmp/fix-infrastructure-serveur.sh"
    echo "   # Collez le contenu"
    echo "   chmod +x /tmp/fix-infrastructure-serveur.sh"
    echo "   /tmp/fix-infrastructure-serveur.sh"
fi

echo ""
echo "🎯 OBJECTIF : Corriger les 3 problèmes identifiés"
echo "  1. Frontend 401 (Basic Auth Kong)"
echo "  2. Studio 502 (Service arrêté)" 
echo "  3. Headers CORS manquants"
echo ""
echo "Après exécution, votre infrastructure sera 100% fonctionnelle ! 🚀"