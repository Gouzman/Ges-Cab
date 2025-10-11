#!/bin/bash

echo "🏢 Diagnostic Hostinger pour ges-cab.com"
echo "========================================"
echo ""

domain="ges-cab.com"
target_ip="82.25.116.122"

echo "🔍 Analyse actuelle du domaine..."
echo ""

# 1. Vérifier l'IP actuelle
current_ip=$(nslookup $domain 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
echo "📍 IP actuelle : $current_ip"
echo "🎯 IP cible    : $target_ip"

# 2. Vérifier les headers HTTP
echo ""
echo "🌐 Test HTTP du domaine..."
http_response=$(curl -I -s http://$domain | head -3)
echo "$http_response"

# 3. Analyser si c'est Hostinger
if echo "$http_response" | grep -q "hcdn\|hostinger"; then
    echo ""
    echo "✅ CONFIRMÉ : Domaine hébergé chez Hostinger"
    echo ""
    echo "📋 ACTIONS À FAIRE :"
    echo "1. Connectez-vous à : https://hpanel.hostinger.com"
    echo "2. Allez dans 'Domaines' → 'ges-cab.com'"
    echo "3. Cherchez 'DNS Zone Editor' ou 'DNS Records'"
    echo "4. Remplacez l'IP par : $target_ip"
    echo ""
    echo "📖 Guide détaillé : GUIDE-HOSTINGER-DNS.md"
    
elif echo "$http_response" | grep -q "404\|nginx\|apache"; then
    echo ""
    echo "✅ BONNE NOUVELLE : Le domaine pointe déjà vers un serveur web"
    echo "🔄 Il se peut que la configuration soit en cours..."
    
else
    echo ""
    echo "⚠️  Réponse inattendue du serveur"
    echo "📞 Contactez le support de votre hébergeur"
fi

# 4. Comparaison IP
echo ""
if [ "$current_ip" = "$target_ip" ]; then
    echo "🎉 PARFAIT : Le DNS pointe vers le bon serveur !"
    echo "🚀 Vous pouvez maintenant activer HTTPS :"
    echo "   ./enable-https-complete.sh"
else
    echo "⏳ DNS à configurer : $current_ip → $target_ip"
    echo ""
    echo "🔧 Après modification DNS, surveillez avec :"
    echo "   ./monitor-dns-propagation.sh"
fi

echo ""
echo "=============================================="
echo ""