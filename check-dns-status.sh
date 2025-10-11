#!/bin/bash

echo "🔍 VÉRIFICATION RAPIDE DNS - ges-cab.com"
echo "========================================"
echo ""

domain="ges-cab.com"
target_ip="82.25.116.122"
old_ip="84.32.84.32"

# Test DNS actuel
echo "📍 Test DNS actuel..."
current_ip=$(nslookup $domain 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')

echo "   Domaine  : $domain"
echo "   IP actuelle : $current_ip"
echo "   IP cible    : $target_ip"
echo ""

# Analyse du statut
if [ "$current_ip" = "$target_ip" ]; then
    echo "🎉 PARFAIT ! DNS configuré correctement"
    echo "🚀 Vous pouvez activer HTTPS :"
    echo "   ./enable-https-complete.sh"
    
elif [ "$current_ip" = "$old_ip" ]; then
    echo "⏳ DNS pas encore modifié"
    echo ""
    echo "📋 À FAIRE :"
    echo "1. Connectez-vous : https://hpanel.hostinger.com"
    echo "2. Domaines → ges-cab.com → DNS Zone Editor"
    echo "3. Changez $old_ip → $target_ip"
    echo "4. Lancez : ./monitor-dns-propagation.sh"
    
else
    echo "❓ IP inattendue : $current_ip"
    echo "🔧 Vérifiez votre configuration DNS"
fi

echo ""
echo "📊 STATUT DES DOMAINES À VÉRIFIER :"
echo "-----------------------------------"

domains=("ges-cab.com" "www.ges-cab.com" "api.ges-cab.com" "studio.ges-cab.com")

for domain in "${domains[@]}"; do
    ip=$(nslookup $domain 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
    if [ "$ip" = "$target_ip" ]; then
        echo "✅ $domain → $ip"
    elif [ "$ip" = "$old_ip" ]; then
        echo "⏳ $domain → $ip (à configurer)"
    elif [ -n "$ip" ]; then
        echo "❓ $domain → $ip (inattendu)"
    else
        echo "❌ $domain → Non résolu"
    fi
done

echo ""
echo "🔧 OUTILS DISPONIBLES :"
echo "  ./monitor-dns-propagation.sh  → Surveillance temps réel"
echo "  ./diagnose-hostinger.sh       → Diagnostic complet"
echo "  ./enable-https-complete.sh    → Activation HTTPS (après DNS)"
echo ""