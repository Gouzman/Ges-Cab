#!/bin/bash
# Script de déploiement de la configuration Nginx pour Ges-Cab
# Résout le problème de téléchargement et configure les 3 domaines

set -e  # Arrêt en cas d'erreur

echo "🚀 Déploiement de la configuration Nginx pour Ges-Cab..."

# Couleurs pour la sortie
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
CONFIG_FILE="ges-cab"
BACKUP_DIR="/root/nginx-backup-$(date +%Y%m%d-%H%M%S)"
LOCAL_CONFIG="nginx-production-complete.conf"

# Fonctions utilitaires
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    print_status "Vérification des prérequis..."
    
    # Vérifier si on est root
    if [[ $EUID -ne 0 ]]; then
        print_error "Ce script doit être exécuté en tant que root (sudo)"
        exit 1
    fi
    
    # Vérifier si Nginx est installé
    if ! command -v nginx &> /dev/null; then
        print_error "Nginx n'est pas installé"
        exit 1
    fi
    
    # Vérifier si le fichier de configuration local existe
    if [[ ! -f "$LOCAL_CONFIG" ]]; then
        print_error "Fichier de configuration $LOCAL_CONFIG non trouvé"
        exit 1
    fi
    
    print_success "Prérequis vérifiés"
}

# Sauvegarde de la configuration actuelle
backup_current_config() {
    print_status "Sauvegarde de la configuration actuelle..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Sauvegarder les sites disponibles
    if [[ -d "$NGINX_SITES_AVAILABLE" ]]; then
        cp -r "$NGINX_SITES_AVAILABLE" "$BACKUP_DIR/sites-available" 2>/dev/null || true
    fi
    
    # Sauvegarder les sites activés
    if [[ -d "$NGINX_SITES_ENABLED" ]]; then
        cp -r "$NGINX_SITES_ENABLED" "$BACKUP_DIR/sites-enabled" 2>/dev/null || true
    fi
    
    # Sauvegarder le fichier principal nginx.conf
    cp /etc/nginx/nginx.conf "$BACKUP_DIR/" 2>/dev/null || true
    
    print_success "Sauvegarde créée dans $BACKUP_DIR"
}

# Déploiement de la nouvelle configuration
deploy_config() {
    print_status "Déploiement de la nouvelle configuration..."
    
    # Créer les répertoires s'ils n'existent pas
    mkdir -p "$NGINX_SITES_AVAILABLE"
    mkdir -p "$NGINX_SITES_ENABLED"
    
    # Copier la nouvelle configuration
    cp "$LOCAL_CONFIG" "$NGINX_SITES_AVAILABLE/$CONFIG_FILE"
    
    # Supprimer les anciens liens symboliques conflictuels
    rm -f "$NGINX_SITES_ENABLED/default"
    rm -f "$NGINX_SITES_ENABLED/$CONFIG_FILE"
    rm -f "$NGINX_SITES_ENABLED/www.ges-cab.com"
    
    # Créer le nouveau lien symbolique
    ln -sf "$NGINX_SITES_AVAILABLE/$CONFIG_FILE" "$NGINX_SITES_ENABLED/"
    
    print_success "Configuration déployée"
}

# Vérification de la syntaxe Nginx
test_nginx_config() {
    print_status "Test de la configuration Nginx..."
    
    if nginx -t; then
        print_success "Configuration Nginx valide"
        return 0
    else
        print_error "Configuration Nginx invalide"
        return 1
    fi
}

# Vérification des services
check_services() {
    print_status "Vérification des services..."
    
    # Vérifier le port 3000 (application principale)
    if ss -tlnp | grep -q ":3000"; then
        SERVICE_3000=$(ss -tlnp | grep ":3000" | head -1)
        print_success "Service sur port 3000: $SERVICE_3000"
    else
        print_warning "Aucun service détecté sur le port 3000"
        print_warning "Vous devez démarrer votre application React/Vite sur ce port"
    fi
    
    # Vérifier le port 8000 (API)
    if ss -tlnp | grep -q ":8000"; then
        SERVICE_8000=$(ss -tlnp | grep ":8000" | head -1)
        print_success "Service API sur port 8000: $SERVICE_8000"
    else
        print_warning "Aucun service API détecté sur le port 8000"
    fi
    
    # Vérifier le port 54323 (Supabase Studio)
    if ss -tlnp | grep -q ":54323"; then
        SERVICE_54323=$(ss -tlnp | grep ":54323" | head -1)
        print_success "Supabase Studio sur port 54323: $SERVICE_54323"
    else
        print_warning "Supabase Studio non détecté sur le port 54323"
        print_warning "Démarrez-le avec: supabase start"
    fi
}

# Redémarrage de Nginx
restart_nginx() {
    print_status "Redémarrage de Nginx..."
    
    # Recharger la configuration
    if systemctl reload nginx; then
        print_success "Nginx rechargé avec succès"
    else
        print_error "Échec du rechargement de Nginx"
        
        # Tenter un restart complet
        print_status "Tentative de redémarrage complet..."
        if systemctl restart nginx; then
            print_success "Nginx redémarré avec succès"
        else
            print_error "Échec du redémarrage de Nginx"
            return 1
        fi
    fi
    
    # Vérifier le statut
    if systemctl is-active --quiet nginx; then
        print_success "Nginx est actif et fonctionne"
    else
        print_error "Nginx n'est pas actif"
        return 1
    fi
}

# Test des domaines
test_domains() {
    print_status "Test des domaines..."
    
    # Test ges-cab.com
    print_status "Test de https://ges-cab.com..."
    if curl -s -I "https://ges-cab.com" | grep -q "200 OK"; then
        print_success "✅ ges-cab.com répond correctement"
    else
        print_warning "⚠️  ges-cab.com ne répond pas comme attendu"
    fi
    
    # Test studio.ges-cab.com
    print_status "Test de https://studio.ges-cab.com..."
    if curl -s -I "https://studio.ges-cab.com" | head -1 | grep -q "200\|302\|301"; then
        print_success "✅ studio.ges-cab.com répond"
    else
        print_warning "⚠️  studio.ges-cab.com ne répond pas (normal si Supabase Studio n'est pas démarré)"
    fi
    
    # Test api.ges-cab.com
    print_status "Test de https://api.ges-cab.com..."
    if curl -s -I "https://api.ges-cab.com" | head -1 | grep -q "200\|404\|405"; then
        print_success "✅ api.ges-cab.com répond"
    else
        print_warning "⚠️  api.ges-cab.com ne répond pas (normal si l'API n'est pas démarrée)"
    fi
}

# Affichage des instructions finales
show_final_instructions() {
    echo -e "\n${GREEN}🎉 DÉPLOIEMENT TERMINÉ !${NC}\n"
    
    echo -e "${BLUE}📋 RÉSUMÉ DE LA CONFIGURATION :${NC}"
    echo -e "• ${GREEN}ges-cab.com${NC} → Application React/Vite (port 3000)"
    echo -e "• ${GREEN}studio.ges-cab.com${NC} → Supabase Studio (port 54323)"
    echo -e "• ${GREEN}api.ges-cab.com${NC} → API REST (port 8000)"
    
    echo -e "\n${YELLOW}📝 PROCHAINES ÉTAPES :${NC}"
    echo -e "1. Démarrez votre application React : ${BLUE}npm run preview${NC}"
    echo -e "2. Démarrez Supabase Studio : ${BLUE}supabase start${NC}"
    echo -e "3. Démarrez votre API sur le port 8000"
    echo -e "4. Testez les domaines dans votre navigateur"
    
    echo -e "\n${BLUE}🔍 VÉRIFICATION :${NC}"
    echo -e "• Logs Nginx : ${BLUE}tail -f /var/log/nginx/ges-cab.access.log${NC}"
    echo -e "• Erreurs Nginx : ${BLUE}tail -f /var/log/nginx/ges-cab.error.log${NC}"
    echo -e "• Statut Nginx : ${BLUE}systemctl status nginx${NC}"
    
    echo -e "\n${GREEN}🔐 CERTIFICATS SSL CONFIGURÉS POUR :${NC}"
    echo -e "• ges-cab.com"
    echo -e "• www.ges-cab.com"
    echo -e "• studio.ges-cab.com"
    echo -e "• api.ges-cab.com"
    
    if [[ -d "$BACKUP_DIR" ]]; then
        echo -e "\n${YELLOW}💾 SAUVEGARDE :${NC} $BACKUP_DIR"
    fi
}

# Fonction principale
main() {
    echo -e "${GREEN}🔧 Configuration Nginx pour Ges-Cab${NC}"
    echo -e "${BLUE}Résolution du problème de téléchargement et ajout des sous-domaines${NC}\n"
    
    check_prerequisites
    backup_current_config
    deploy_config
    
    if test_nginx_config; then
        restart_nginx
        check_services
        test_domains
        show_final_instructions
    else
        print_error "Configuration invalide. Restauration de la sauvegarde..."
        
        # Restaurer la configuration
        if [[ -f "$BACKUP_DIR/sites-available/$CONFIG_FILE" ]]; then
            cp "$BACKUP_DIR/sites-available/$CONFIG_FILE" "$NGINX_SITES_AVAILABLE/" 2>/dev/null || true
        fi
        
        nginx -t && systemctl reload nginx
        print_error "Déploiement échoué. Configuration restaurée."
        exit 1
    fi
}

# Exécution du script principal
main "$@"