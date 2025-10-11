#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 DÉPLOIEMENT TEMPORAIRE - SOUS-DOMAINE
# ═══════════════════════════════════════════════════════════════════════════════

echo "🎯 Déploiement temporaire - Configuration correcte"
echo ""
echo "OPTION 1 - Créer un sous-domaine app.ges-cab.com:"
echo "   • Application: https://app.ges-cab.com"
echo "   • API: https://api.ges-cab.com" 
echo "   • Studio: https://studio.ges-cab.com"
echo ""
echo "OPTION 2 - Corriger le DNS principal:"
echo "   • Modifier ges-cab.com: 84.32.84.32 → 82.25.116.122"
echo "   • Puis déployer normalement"
echo ""
echo "OPTION 3 - Utiliser l'ancien serveur:"
echo "   • Déployer sur 84.32.84.32 (où pointe actuellement ges-cab.com)"
echo ""

read -p "Choisissez une option (1/2/3): " -n 1 -r
echo

case $REPLY in
    1)
        echo "📋 IMPORTANT: Vous devez d'abord créer un enregistrement DNS:"
        echo "   app.ges-cab.com → 82.25.116.122"
        echo ""
        read -p "Avez-vous créé l'enregistrement DNS app.ges-cab.com ? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🚀 Déploiement sur app.ges-cab.com..."
            ./scripts/deploy-production.sh app.ges-cab.com root@82.25.116.122
        else
            echo "❌ Créez d'abord l'enregistrement DNS puis relancez"
        fi
        ;;
    2)
        echo "📋 ÉTAPES pour corriger le DNS:"
        echo "1. Connectez-vous à votre registrar de domaine"
        echo "2. Modifiez l'enregistrement A: ges-cab.com → 82.25.116.122"
        echo "3. Attendez la propagation DNS (5-60 minutes)"
        echo "4. Relancez: ./deploy-now.sh"
        ;;
    3)
        echo "🚀 Déploiement sur l'ancien serveur 84.32.84.32..."
        ./scripts/deploy-production.sh ges-cab.com root@84.32.84.32
        ;;
    *)
        echo "❌ Option invalide"
        exit 1
        ;;
esac