#!/bin/bash

# Script de gestion Supabase pour Ges-Cab
# Usage: ./scripts/supabase-manager.sh [command]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() { echo -e "${BLUE}📋 $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

show_help() {
    echo "🗄️  Script de gestion Supabase pour Ges-Cab"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Démarrer l'environnement Supabase local"
    echo "  stop        Arrêter l'environnement Supabase local"
    echo "  reset       Réinitialiser la base de données"
    echo "  migrate     Appliquer les migrations"
    echo "  seed        Charger les données de test"
    echo "  status      Afficher le statut des services"
    echo "  studio      Ouvrir Supabase Studio"
    echo "  link        Lier le projet à un projet Supabase distant"
    echo "  deploy      Déployer les migrations vers le projet distant"
    echo "  help        Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 start     # Démarre l'environnement local"
    echo "  $0 migrate   # Applique les migrations"
    echo "  $0 seed      # Charge les données de test"
}

start_supabase() {
    print_step "Démarrage de l'environnement Supabase local..."
    
    if ! supabase status 2>/dev/null | grep -q "All services are running"; then
        supabase start
        print_success "Supabase démarré"
    else
        print_success "Supabase est déjà en cours d'exécution"
    fi
    
    echo ""
    echo "🌐 URLs locales :"
    echo "   API URL: http://localhost:54321"
    echo "   Studio: http://localhost:54323"
    echo "   DB URL: postgresql://postgres:[password]@localhost:54322/postgres"
    echo ""
}

stop_supabase() {
    print_step "Arrêt de l'environnement Supabase local..."
    supabase stop
    print_success "Supabase arrêté"
}

reset_database() {
    print_step "Réinitialisation de la base de données..."
    print_warning "Cette action va supprimer toutes les données!"
    read -p "Êtes-vous sûr ? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        supabase db reset
        print_success "Base de données réinitialisée"
    else
        print_warning "Opération annulée"
    fi
}

apply_migrations() {
    print_step "Application des migrations..."
    
    # Vérifier si Supabase est démarré
    if ! supabase status 2>/dev/null | grep -q "DB URL"; then
        print_error "Supabase n'est pas démarré. Utilisez '$0 start' d'abord."
        exit 1
    fi
    
    supabase db reset --linked
    print_success "Migrations appliquées"
}

load_seed_data() {
    print_step "Chargement des données de test..."
    
    if [ -f "supabase/seed.sql" ]; then
        supabase db reset --linked
        print_success "Données de test chargées"
    else
        print_error "Fichier seed.sql non trouvé"
        exit 1
    fi
}

show_status() {
    print_step "Statut des services Supabase..."
    supabase status
}

open_studio() {
    print_step "Ouverture de Supabase Studio..."
    
    if ! supabase status 2>/dev/null | grep -q "Studio URL"; then
        print_error "Supabase n'est pas démarré. Utilisez '$0 start' d'abord."
        exit 1
    fi
    
    STUDIO_URL=$(supabase status | grep "Studio URL" | awk '{print $3}')
    open "$STUDIO_URL"
    print_success "Studio ouvert dans le navigateur"
}

link_project() {
    print_step "Liaison avec un projet Supabase distant..."
    
    echo "Pour lier votre projet local à un projet Supabase distant :"
    echo "1. Créez un projet sur https://app.supabase.com"
    echo "2. Obtenez votre Project Reference (dans Settings > General)"
    echo ""
    
    read -p "Project Reference (ex: abcdefghijklmnop): " PROJECT_REF
    
    if [ -n "$PROJECT_REF" ]; then
        supabase link --project-ref "$PROJECT_REF"
        print_success "Projet lié avec succès"
    else
        print_warning "Project Reference requis"
        exit 1
    fi
}

deploy_migrations() {
    print_step "Déploiement des migrations vers le projet distant..."
    
    # Vérifier si le projet est lié
    if [ ! -f ".supabase/config.toml" ]; then
        print_error "Projet non lié. Utilisez '$0 link' d'abord."
        exit 1
    fi
    
    supabase db push
    print_success "Migrations déployées"
}

# Menu principal
case "${1:-help}" in
    "start")
        start_supabase
        ;;
    "stop")
        stop_supabase
        ;;
    "reset")
        reset_database
        ;;
    "migrate")
        apply_migrations
        ;;
    "seed")
        load_seed_data
        ;;
    "status")
        show_status
        ;;
    "studio")
        open_studio
        ;;
    "link")
        link_project
        ;;
    "deploy")
        deploy_migrations
        ;;
    "help"|*)
        show_help
        ;;
esac