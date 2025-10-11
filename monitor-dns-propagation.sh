#!/bin/bash

echo "🔍 Surveillance de la propagation DNS pour ges-cab.com"
echo "====================================================="
echo ""

domains=("ges-cab.com" "www.ges-cab.com" "api.ges-cab.com" "studio.ges-cab.com")
old_ip="84.32.84.32"
new_ip="82.25.116.122"

check_dns_change() {
    local domain=$1
    echo "🌐 Vérification de $domain..."
    
    # Test avec nslookup
    result=$(nslookup $domain 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
    
    if [ "$result" = "$new_ip" ]; then
        echo "  ✅ $domain → $result (NOUVEAU - OK !)"
        return 0
    elif [ "$result" = "$old_ip" ]; then
        echo "  ⏳ $domain → $result (ANCIEN - propagation en cours...)"
        return 1
    elif [ -n "$result" ]; then
        echo "  ❓ $domain → $result (INATTENDU)"
        return 1
    else
        echo "  ❌ $domain → Non résolu"
        return 1
    fi
}

echo "🎯 IP cible : $new_ip"
echo "📍 Ancienne IP : $old_ip"
echo ""

while true; do
    echo "$(date '+%H:%M:%S') - Vérification en cours..."
    echo ""
    
    all_updated=true
    for domain in "${domains[@]}"; do
        if ! check_dns_change "$domain"; then
            all_updated=false
        fi
    done
    
    echo ""
    if [ "$all_updated" = true ]; then
        echo "🎉 PROPAGATION TERMINÉE ! TOUS LES DOMAINES SONT CONFIGURÉS !"
        echo "============================================="
        echo ""
        echo "🔐 Vous pouvez maintenant activer HTTPS :"
        echo "  ./enable-https-complete.sh"
        echo ""
        echo "🌐 Testez vos domaines :"
        echo "  http://www.ges-cab.com"
        echo "  http://api.ges-cab.com"
        echo "  http://studio.ges-cab.com"
        echo ""
        break
    else
        echo "⏳ Propagation en cours... Nouvelle vérification dans 2 minutes."
        echo "   (Appuyez sur Ctrl+C pour arrêter)"
        echo ""
        sleep 120
    fi
done