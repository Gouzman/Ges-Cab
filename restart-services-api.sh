#!/bin/bash

echo "🔄 TENTATIVE DE REDÉMARRAGE VIA API"
echo "==================================="

# Si vous avez configuré une API de monitoring
echo "Test de l'API de santé..."
curl -f https://ges-cab.com/health 2>/dev/null && echo "✅ API répond" || echo "❌ API ne répond pas"

# Alternative : utiliser un service de monitoring externe
echo ""
echo "💡 Alternatives :"
echo "1. Panel d'administration de votre hébergeur"
echo "2. Console web de votre VPS"
echo "3. Redémarrage depuis l'interface de gestion"
