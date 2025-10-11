#!/bin/bash

echo "🧪 TEST APRÈS SUPPRESSION DU CACHE"
echo "=================================="
echo ""

echo "Testez maintenant ces URLs dans votre navigateur :"
echo ""
echo "🔗 https://ges-cab.com"
echo "🔗 https://www.ges-cab.com"
echo ""

echo "Si ça fonctionne :"
echo "✅ Problème résolu ! C'était bien le cache."
echo ""
echo "Si ça ne fonctionne toujours pas :"
echo "1. Essayez en navigation privée"
echo "2. Testez depuis votre téléphone (4G)"
echo "3. Relancez le diagnostic : ./diagnostic-urgence.sh"
echo ""

# Test automatique
echo "Test automatique en cours..."
if curl -f -s https://ges-cab.com > /dev/null 2>&1; then
    echo "✅ Le serveur répond correctement"
    echo "Si vous voyez encore l'erreur, c'est définitivement un problème de cache local"
else
    echo "❌ Le serveur ne répond pas"
    echo "Le problème n'est pas uniquement le cache"
fi
