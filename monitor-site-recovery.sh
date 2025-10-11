#!/bin/bash

echo "📊 MONITORING CONTINU DE RÉCUPÉRATION"
echo "====================================="

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Test HTTPS
    if curl -f -s https://ges-cab.com > /dev/null 2>&1; then
        echo "[$TIMESTAMP] ✅ Site accessible"
        break
    else
        echo "[$TIMESTAMP] ❌ Site inaccessible - Retry dans 30s..."
        sleep 30
    fi
done

echo "🎉 SITE RÉCUPÉRÉ ! Lancement de tests complets..."

# Tests complets après récupération
curl -I https://ges-cab.com
echo ""
echo "🚀 Le site est de nouveau fonctionnel !"
