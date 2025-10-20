#!/bin/bash

# 🔄 Script de Basculement Automatique des Environnements
# Ges-Cab Environment Switcher

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fichiers de configuration
ENV_LOCAL=".env.local"
ENV_PRODUCTION=".env.production"
BACKUP_DIR=".env_backups"

# Fonction d'affichage coloré
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Créer le répertoire de sauvegarde
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_status "Répertoire de sauvegarde créé: $BACKUP_DIR"
    fi
}

# Sauvegarder la configuration actuelle
backup_current_config() {
    create_backup_dir
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    if [ -f "$ENV_LOCAL" ]; then
        cp "$ENV_LOCAL" "$BACKUP_DIR/env.local.$timestamp"
        print_status "Configuration actuelle sauvegardée: $BACKUP_DIR/env.local.$timestamp"
    fi
}

# Afficher l'environnement actuel
show_current_env() {
    print_status "Configuration actuelle:"
    if [ -f "$ENV_LOCAL" ]; then
        local supabase_url=$(grep "^VITE_SUPABASE_URL=" "$ENV_LOCAL" | cut -d'=' -f2 | tr -d '"')
        local app_name=$(grep "^VITE_APP_NAME=" "$ENV_LOCAL" | cut -d'=' -f2 | tr -d '"')
        local environment=$(grep "^VITE_ENVIRONMENT=" "$ENV_LOCAL" | cut -d'=' -f2 | tr -d '"')
        
        echo -e "  📱 App: ${YELLOW}${app_name}${NC}"
        echo -e "  🌍 Environment: ${YELLOW}${environment}${NC}"
        echo -e "  🔗 Supabase: ${YELLOW}${supabase_url}${NC}"
    else
        print_warning "Fichier .env.local non trouvé"
    fi
}

# Basculer vers environnement local
switch_to_local() {
    print_status "🧪 Basculement vers l'environnement LOCAL..."
    backup_current_config
    
    # Créer la configuration locale
    cat > "$ENV_LOCAL" << 'EOF'
# ===============================================
# 🧪 ENVIRONNEMENT DE DÉVELOPPEMENT LOCAL
# ===============================================

# 🔐 CONFIGURATION SUPABASE LOCAL
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# 🌐 CONFIGURATION APPLICATION
VITE_APP_URL=http://localhost:3001
VITE_APP_NAME=Ges-Cab (Dev)
VITE_APP_VERSION=dev-local
VITE_DEBUG_MODE=true
VITE_ENVIRONMENT=development

# 🗄️ BASE DE DONNÉES LOCALE
VITE_DB_HOST=localhost
VITE_DB_PORT=54322
VITE_DB_NAME=postgres
VITE_DB_USER=postgres
VITE_DB_PASSWORD=postgres
EOF

    print_success "✅ Configuration LOCAL activée"
    print_warning "📋 N'oubliez pas de démarrer Supabase: supabase start"
}

# Basculer vers Supabase Cloud
switch_to_cloud() {
    print_status "☁️ Basculement vers SUPABASE CLOUD..."
    backup_current_config
    
    cat > "$ENV_LOCAL" << 'EOF'
# ===============================================
# ☁️ DÉVELOPPEMENT AVEC SUPABASE CLOUD
# ===============================================

# 🔐 CONFIGURATION SUPABASE CLOUD
VITE_SUPABASE_URL=https://gesadminsystem.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc2FkbWluc3lzdGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0Mzc2NzAsImV4cCI6MjA0NTAxMzY3MH0.V3dJCMNfGpnP3_o-h_Nh0KdZr5vU6EGNL8HUvNLdjrY

# 🌐 CONFIGURATION APPLICATION
VITE_APP_URL=http://localhost:3001
VITE_APP_NAME=Ges-Cab (Cloud Dev)
VITE_APP_VERSION=dev-cloud
VITE_DEBUG_MODE=true
VITE_ENVIRONMENT=development-cloud
EOF

    print_success "✅ Configuration SUPABASE CLOUD activée"
}

# Basculer vers VPS auto-hébergé
switch_to_vps() {
    print_status "🏢 Basculement vers VPS AUTO-HÉBERGÉ..."
    backup_current_config
    
    cat > "$ENV_LOCAL" << 'EOF'
# ===============================================
# 🏢 DÉVELOPPEMENT AVEC VPS AUTO-HÉBERGÉ
# ===============================================

# 🔐 CONFIGURATION VPS
VITE_SUPABASE_URL=https://api.ges-cab.com
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc2NhYiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzYwNDI5NzYwfQ.ooZf1q1eWVOj-3xrFrvR3OazM9RV7i0npZyBxJKp6V4

# 🌐 CONFIGURATION APPLICATION
VITE_APP_URL=http://localhost:3001
VITE_APP_NAME=Ges-Cab (VPS Dev)
VITE_APP_VERSION=dev-vps
VITE_DEBUG_MODE=true
VITE_ENVIRONMENT=development-vps
EOF

    print_success "✅ Configuration VPS AUTO-HÉBERGÉ activée"
}

# Tester la connectivité
test_connectivity() {
    print_status "🔍 Test de connectivité..."
    
    local supabase_url=$(grep "^VITE_SUPABASE_URL=" "$ENV_LOCAL" | cut -d'=' -f2 | tr -d '"')
    
    if [[ "$supabase_url" == *"127.0.0.1"* ]]; then
        print_status "Test Supabase local..."
        if curl -s "http://127.0.0.1:54321/health" > /dev/null; then
            print_success "✅ Supabase local accessible"
        else
            print_error "❌ Supabase local non accessible. Exécutez: supabase start"
        fi
    else
        print_status "Test Supabase distant..."
        if curl -s "${supabase_url}/rest/v1/" > /dev/null; then
            print_success "✅ Supabase distant accessible"
        else
            print_error "❌ Supabase distant non accessible: $supabase_url"
        fi
    fi
}

# Menu principal
show_menu() {
    echo ""
    echo -e "${BLUE}🔄 Gestionnaire d'Environnements Ges-Cab${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
    show_current_env
    echo ""
    echo "Choisissez votre environnement:"
    echo -e "  ${GREEN}1)${NC} 🧪 Local (Supabase CLI + Docker)"
    echo -e "  ${GREEN}2)${NC} ☁️  Supabase Cloud"
    echo -e "  ${GREEN}3)${NC} 🏢 VPS Auto-hébergé"
    echo -e "  ${GREEN}4)${NC} 🔍 Tester la connectivité"
    echo -e "  ${GREEN}5)${NC} 📋 Afficher la configuration"
    echo -e "  ${GREEN}0)${NC} 🚪 Quitter"
    echo ""
}

# Boucle principale
main() {
    while true; do
        show_menu
        read -p "Votre choix [0-5]: " choice
        
        case $choice in
            1)
                switch_to_local
                ;;
            2)
                switch_to_cloud
                ;;
            3)
                switch_to_vps
                ;;
            4)
                test_connectivity
                ;;
            5)
                show_current_env
                ;;
            0)
                print_success "👋 À bientôt!"
                exit 0
                ;;
            *)
                print_error "❌ Choix invalide. Veuillez choisir entre 0 et 5."
                ;;
        esac
        
        echo ""
        read -p "Appuyez sur Entrée pour continuer..."
    done
}

# Vérification des prérequis
check_requirements() {
    if ! command -v curl &> /dev/null; then
        print_error "curl n'est pas installé. Veuillez l'installer."
        exit 1
    fi
    
    if [ ! -f "package.json" ]; then
        print_error "Ce script doit être exécuté depuis la racine du projet Ges-Cab"
        exit 1
    fi
}

# Point d'entrée
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_requirements
    
    # Si des arguments sont passés, exécuter directement
    case "${1:-}" in
        "local"|"l")
            switch_to_local
            ;;
        "cloud"|"c")
            switch_to_cloud
            ;;
        "vps"|"v")
            switch_to_vps
            ;;
        "test"|"t")
            test_connectivity
            ;;
        *)
            main
            ;;
    esac
fi