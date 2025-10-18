#!/bin/bash
# Script pour démarrer l'application Ges-Cab en mode production
# À utiliser sur le serveur après le déploiement

set -e

echo "🚀 Démarrage de Ges-Cab en mode production..."

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

# Fonction pour vérifier si un port est libre
check_port() {
    local port=$1
    if ss -tlnp | grep -q ":$port "; then
        return 1  # Port occupé
    else
        return 0  # Port libre
    fi
}

# Fonction pour tuer un processus sur un port
kill_process_on_port() {
    local port=$1
    local pid=$(ss -tlnp | grep ":$port " | grep -o 'pid=[0-9]*' | cut -d'=' -f2 | head -1)
    if [[ -n "$pid" ]]; then
        print_status "Arrêt du processus $pid sur le port $port"
        kill -9 "$pid" 2>/dev/null || true
        sleep 2
    fi
}

# Construire l'application si nécessaire
build_app() {
    print_status "Construction de l'application..."
    
    if [[ -f "package.json" ]]; then
        # Installer les dépendances si nécessaire
        if [[ ! -d "node_modules" ]]; then
            print_status "Installation des dépendances..."
            npm install
        fi
        
        # Construire l'application
        print_status "Build de l'application React/Vite..."
        npm run build
        print_success "Application construite"
    else
        print_warning "package.json non trouvé. Assurez-vous d'être dans le bon répertoire."
        exit 1
    fi
}

# Démarrer l'application sur le port 3000
start_app() {
    print_status "Démarrage de l'application sur le port 3000..."
    
    # Vérifier si le port 3000 est libre
    if ! check_port 3000; then
        print_warning "Le port 3000 est occupé. Arrêt du processus existant..."
        kill_process_on_port 3000
    fi
    
    # Démarrer en mode preview (pour servir le build)
    print_status "Lancement du serveur Vite en mode preview..."
    npm run preview &
    
    # Attendre que le serveur démarre
    sleep 5
    
    if check_port 3000; then
        print_warning "Le serveur n'a pas pu démarrer sur le port 3000"
        return 1
    else
        print_success "✅ Application démarrée sur http://localhost:3000"
        return 0
    fi
}

# Démarrer Supabase (optionnel)
start_supabase() {
    print_status "Démarrage de Supabase..."
    
    if command -v supabase &> /dev/null; then
        # Vérifier si Supabase est déjà démarré
        if ! check_port 54323; then
            print_warning "Supabase Studio semble déjà démarré sur le port 54323"
        else
            print_status "Démarrage de Supabase..."
            supabase start &
            sleep 10
            
            if check_port 54323; then
                print_warning "Supabase Studio n'a pas pu démarrer"
            else
                print_success "✅ Supabase Studio démarré sur http://localhost:54323"
            fi
        fi
    else
        print_warning "Supabase CLI non installé. Installation :"
        print_warning "npm install -g supabase"
    fi
}

# Vérifier les services API (port 8000)
check_api() {
    print_status "Vérification de l'API sur le port 8000..."
    
    if check_port 8000; then
        print_warning "Aucune API détectée sur le port 8000"
        print_warning "Si vous avez une API PostgREST ou Supabase, démarrez-la manuellement"
    else
        print_success "✅ API détectée sur le port 8000"
    fi
}

# Afficher le statut des services
show_status() {
    echo -e "\n${GREEN}📊 STATUT DES SERVICES :${NC}\n"
    
    # Port 3000 - Application
    if check_port 3000; then
        echo -e "❌ Application (port 3000) : ${YELLOW}Non démarrée${NC}"
    else
        echo -e "✅ Application (port 3000) : ${GREEN}Démarrée${NC}"
    fi
    
    # Port 54323 - Supabase Studio
    if check_port 54323; then
        echo -e "❌ Supabase Studio (port 54323) : ${YELLOW}Non démarré${NC}"
    else
        echo -e "✅ Supabase Studio (port 54323) : ${GREEN}Démarré${NC}"
    fi
    
    # Port 8000 - API
    if check_port 8000; then
        echo -e "❌ API (port 8000) : ${YELLOW}Non démarrée${NC}"
    else
        echo -e "✅ API (port 8000) : ${GREEN}Démarrée${NC}"
    fi
    
    echo -e "\n${BLUE}🌐 ACCÈS AUX SERVICES :${NC}"
    echo -e "• Application : ${GREEN}https://ges-cab.com${NC}"
    echo -e "• Supabase Studio : ${GREEN}https://studio.ges-cab.com${NC}"
    echo -e "• API : ${GREEN}https://api.ges-cab.com${NC}"
    
    echo -e "\n${YELLOW}📝 COMMANDES UTILES :${NC}"
    echo -e "• Logs Nginx : ${BLUE}sudo tail -f /var/log/nginx/ges-cab.access.log${NC}"
    echo -e "• Redémarrer Nginx : ${BLUE}sudo systemctl restart nginx${NC}"
    echo -e "• Arrêter cette app : ${BLUE}pkill -f 'vite preview'${NC}"
}

# Fonction principale
main() {
    echo -e "${GREEN}🔧 Démarrage de Ges-Cab${NC}\n"
    
    # Vérifier qu'on est dans le bon répertoire
    if [[ ! -f "package.json" ]] || [[ ! -f "vite.config.js" ]]; then
        print_warning "Ce script doit être exécuté depuis le répertoire racine de Ges-Cab"
        exit 1
    fi
    
    # Construire et démarrer l'application
    build_app
    
    if start_app; then
        # Démarrer Supabase si disponible
        start_supabase
        
        # Vérifier l'API
        check_api
        
        # Afficher le statut
        show_status
        
        echo -e "\n${GREEN}🎉 Démarrage terminé !${NC}"
        echo -e "${BLUE}L'application est maintenant accessible via Nginx sur https://ges-cab.com${NC}\n"
        
        # Garder le script en vie
        echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter les services${NC}"
        
        # Fonction de nettoyage
        cleanup() {
            echo -e "\n${YELLOW}Arrêt des services...${NC}"
            pkill -f "vite preview" 2>/dev/null || true
            echo -e "${GREEN}Services arrêtés${NC}"
            exit 0
        }
        
        trap cleanup SIGINT SIGTERM
        
        # Attendre indéfiniment
        while true; do
            sleep 10
        done
        
    else
        print_warning "Échec du démarrage de l'application"
        exit 1
    fi
}

# Exécution
main "$@"