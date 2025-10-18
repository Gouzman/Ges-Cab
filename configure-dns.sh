#!/bin/bash
# Configuration DNS pour les sous-domaines Ges-Cab
# Ce script vous guide pour configurer les enregistrements DNS

echo "🌐 Configuration DNS pour Ges-Cab"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

# Obtenir l'IP publique du serveur
get_server_ip() {
    print_status "Détection de l'IP publique du serveur..."
    
    # Essayer plusieurs méthodes pour obtenir l'IP
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || curl -s icanhazip.com 2>/dev/null)
    
    if [[ -n "$SERVER_IP" ]]; then
        print_success "IP publique détectée : $SERVER_IP"
    else
        print_warning "Impossible de détecter l'IP automatiquement"
        read -p "Entrez l'IP publique de votre serveur : " SERVER_IP
    fi
}

# Vérifier la résolution DNS actuelle
check_dns_resolution() {
    print_status "Vérification de la résolution DNS actuelle..."
    
    echo -e "\n${BLUE}📊 RÉSOLUTION DNS ACTUELLE :${NC}"
    
    # Vérifier chaque domaine
    for domain in "ges-cab.com" "www.ges-cab.com" "studio.ges-cab.com" "api.ges-cab.com"; do
        RESOLVED_IP=$(dig +short "$domain" @8.8.8.8 2>/dev/null | tail -1)
        
        if [[ -n "$RESOLVED_IP" && "$RESOLVED_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            if [[ "$RESOLVED_IP" == "$SERVER_IP" ]]; then
                print_success "✅ $domain → $RESOLVED_IP (correct)"
            else
                print_warning "⚠️  $domain → $RESOLVED_IP (devrait être $SERVER_IP)"
            fi
        else
            print_warning "❌ $domain → Non résolu ou erreur"
        fi
    done
}

# Générer les enregistrements DNS requis
generate_dns_records() {
    print_status "Génération des enregistrements DNS requis..."
    
    echo -e "\n${YELLOW}📝 ENREGISTREMENTS DNS À AJOUTER :${NC}\n"
    
    cat << EOF
${BLUE}Chez votre fournisseur DNS (ex: Cloudflare, OVH, Gandi...) :${NC}

Type    Nom                 Valeur              TTL
----    ----                ------              ---
A       @                   ${SERVER_IP}        300
A       www                 ${SERVER_IP}        300
A       studio              ${SERVER_IP}        300
A       api                 ${SERVER_IP}        300

${YELLOW}OU si vous préférez utiliser des CNAME :${NC}

Type    Nom                 Valeur              TTL
----    ----                ------              ---
A       @                   ${SERVER_IP}        300
CNAME   www                 ges-cab.com         300
CNAME   studio              ges-cab.com         300
CNAME   api                 ges-cab.com         300

${BLUE}Configuration pour différents fournisseurs :${NC}

${YELLOW}📌 CLOUDFLARE :${NC}
1. Aller sur https://dash.cloudflare.com
2. Sélectionner votre domaine ges-cab.com
3. Aller dans DNS → Records
4. Ajouter les enregistrements A ci-dessus
5. Activer le mode "Proxy" (nuage orange) pour chaque enregistrement

${YELLOW}📌 OVH :${NC}
1. Aller sur https://www.ovh.com/manager/
2. Domaines → ges-cab.com → Zone DNS
3. Ajouter les enregistrements A ci-dessus
4. TTL recommandé : 300 secondes

${YELLOW}📌 GANDI :${NC}
1. Aller sur https://admin.gandi.net
2. Domaines → ges-cab.com → Enregistrements DNS
3. Ajouter les enregistrements A ci-dessus

${YELLOW}📌 NAMECHEAP :${NC}
1. Aller sur https://ap.www.namecheap.com/
2. Domain List → Manage → Advanced DNS
3. Ajouter les enregistrements A ci-dessus

EOF
}

# Test de propagation DNS
test_dns_propagation() {
    print_status "Test de la propagation DNS..."
    
    echo -e "\n${BLUE}🔄 PROPAGATION DNS :${NC}"
    
    # Serveurs DNS à tester
    DNS_SERVERS=("8.8.8.8" "1.1.1.1" "208.67.222.222" "9.9.9.9")
    
    for domain in "ges-cab.com" "studio.ges-cab.com" "api.ges-cab.com"; do
        echo -e "\n${YELLOW}Test pour $domain :${NC}"
        
        for dns in "${DNS_SERVERS[@]}"; do
            RESOLVED=$(dig +short "$domain" @"$dns" 2>/dev/null | tail -1)
            
            if [[ "$RESOLVED" == "$SERVER_IP" ]]; then
                print_success "✅ $dns : $RESOLVED"
            elif [[ -n "$RESOLVED" ]]; then
                print_warning "⚠️  $dns : $RESOLVED (incorrect)"
            else
                print_warning "❌ $dns : Non résolu"
            fi
        done
    done
}

# Instructions pour vérifier la propagation
show_propagation_tools() {
    echo -e "\n${BLUE}🛠️  OUTILS DE VÉRIFICATION DNS :${NC}\n"
    
    cat << EOF
${YELLOW}En ligne :${NC}
• https://dnschecker.org/ - Vérification globale
• https://www.whatsmydns.net/ - Test multi-serveurs
• https://toolbox.googleapps.com/apps/dig/ - Google Dig

${YELLOW}Ligne de commande :${NC}
• dig ges-cab.com
• nslookup studio.ges-cab.com
• host api.ges-cab.com

${YELLOW}Temps de propagation typiques :${NC}
• Local : 0-30 minutes
• Global : 1-24 heures
• Cache navigateur : Vider le cache DNS

${BLUE}Pour vider le cache DNS local :${NC}
• Windows : ipconfig /flushdns
• Mac : sudo dscacheutil -flushcache
• Linux : sudo systemctl restart systemd-resolved

EOF
}

# Conseils de sécurité pour DNS
show_security_tips() {
    echo -e "\n${BLUE}🔒 CONSEILS DE SÉCURITÉ DNS :${NC}\n"
    
    cat << EOF
${YELLOW}1. Activation DNSSEC :${NC}
   Activez DNSSEC chez votre fournisseur DNS pour éviter les attaques

${YELLOW}2. TTL approprié :${NC}
   • Pendant la configuration : TTL court (300s)
   • En production : TTL plus long (3600s)

${YELLOW}3. Surveillance :${NC}
   • Configurer des alertes de changement DNS
   • Vérifier régulièrement la résolution

${YELLOW}4. Backup DNS :${NC}
   • Configurer un serveur DNS secondaire
   • Documenter la configuration

EOF
}

# Fonction principale
main() {
    echo -e "${GREEN}🌐 Configuration DNS pour Ges-Cab${NC}\n"
    
    get_server_ip
    check_dns_resolution
    generate_dns_records
    test_dns_propagation
    show_propagation_tools
    show_security_tips
    
    echo -e "\n${GREEN}🎉 Guide DNS terminé !${NC}"
    echo -e "${BLUE}Après avoir configuré les DNS, attendez 15-30 minutes puis relancez le test${NC}\n"
}

# Exécution
main "$@"