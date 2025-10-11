#!/bin/bash

echo "🔍 Vérification de la propagation DNS pour ges-cab.com"
echo "======================================================"
echo ""

domains=("app.ges-cab.com" "api.ges-cab.com" "studio.ges-cab.com")
target_ip="82.25.116.122"

check_dns() {
    local domain=$1
    echo "🌐 Vérification de $domain..."
    
    # Test avec nslookup
    result=$(nslookup $domain 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
    
    if [ "$result" = "$target_ip" ]; then
        echo "  ✅ $domain → $result (OK)"
        return 0
    elif [ -n "$result" ]; then
        echo "  ❌ $domain → $result (devrait être $target_ip)"
        return 1
    else
        echo "  ⏳ $domain → Non résolu (propagation en cours...)"
        return 1
    fi
}

echo "Vérification en cours..."
echo ""

all_good=true
for domain in "${domains[@]}"; do
    if ! check_dns "$domain"; then
        all_good=false
    fi
done

echo ""
if [ "$all_good" = true ]; then
    echo "🎉 TOUS LES DOMAINES SONT CORRECTEMENT CONFIGURÉS !"
    echo "=================================="
    echo ""
    echo "Vous pouvez maintenant activer HTTPS :"
    echo "  ./enable-https.sh"
    echo ""
else
    echo "⏳ PROPAGATION DNS EN COURS"
    echo "=========================="
    echo ""
    echo "📋 Vérifiez que vous avez bien créé ces enregistrements A :"
    echo "  app.ges-cab.com     → 82.25.116.122"
    echo "  api.ges-cab.com     → 82.25.116.122"
    echo "  studio.ges-cab.com  → 82.25.116.122"
    echo ""
    echo "⏰ La propagation DNS peut prendre de 15 minutes à 24 heures."
    echo "   Relancez ce script régulièrement pour vérifier."
    echo ""
fi

# Test de connectivité vers le serveur
echo ""
echo "🔧 Test de connectivité vers le serveur..."
if ping -c 1 $target_ip > /dev/null 2>&1; then
    echo "  ✅ Serveur $target_ip accessible"
else
    echo "  ❌ Serveur $target_ip non accessible"
fi

echo ""
echo "📍 Pour vérifier manuellement, utilisez :"
echo "  nslookup app.ges-cab.com"
echo "  dig app.ges-cab.com"
echo ""