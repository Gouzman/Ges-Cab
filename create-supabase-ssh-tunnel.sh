#!/bin/bash
# Script pour créer un tunnel SSH vers les services Supabase

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔗 Création d'un tunnel SSH vers les services Supabase...${NC}"

# Configuration des variables
SSH_USER="ubuntu"  # Remplacez par votre utilisateur SSH réel
SSH_HOST="82.25.116.122"  # Remplacez par l'adresse IP réelle du VPS
SSH_PORT="22"  # Port SSH par défaut

# Détecter automatiquement si un paramètre a été passé
if [ -n "$1" ]; then
  choice="$1"
else
  # Choisir le service à tunneliser
  echo -e "\n${BLUE}Quel service souhaitez-vous tunneliser?${NC}"
  echo -e "1) API Supabase (port 8000)"
  echo -e "2) Studio Supabase (port 3000)"
  echo -e "3) PostgreSQL (port 5432)"
  echo -e "4) Tous les services (ports 8000, 3000, 5432)"
  read -p "Choix (1-4): " choice
fi

case $choice in
  1)
    # Tunnel pour l'API Supabase
    services="API Supabase"
    tunnel_cmd="ssh -o StrictHostKeyChecking=no -p $SSH_PORT -L 8000:localhost:8000 $SSH_USER@$SSH_HOST -N"
    local_url="http://localhost:8000"
    ;;
  2)
    # Tunnel pour Studio Supabase
    services="Studio Supabase"
    tunnel_cmd="ssh -o StrictHostKeyChecking=no -p $SSH_PORT -L 3000:localhost:3000 $SSH_USER@$SSH_HOST -N"
    local_url="http://localhost:3000"
    ;;
  3)
    # Tunnel pour PostgreSQL
    services="PostgreSQL"
    tunnel_cmd="ssh -o StrictHostKeyChecking=no -p $SSH_PORT -L 5432:localhost:5432 $SSH_USER@$SSH_HOST -N"
    local_url="localhost:5432"
    ;;
  4)
    # Tunnel pour tous les services
    services="tous les services"
    tunnel_cmd="ssh -o StrictHostKeyChecking=no -p $SSH_PORT -L 8000:localhost:8000 -L 3000:localhost:3000 -L 5432:localhost:5432 $SSH_USER@$SSH_HOST -N"
    local_url="http://localhost:8000 (API), http://localhost:3000 (Studio), localhost:5432 (PostgreSQL)"
    ;;
  *)
    echo -e "${RED}❌ Choix invalide.${NC}"
    exit 1
    ;;
esac

echo -e "\n${BLUE}Création d'un tunnel SSH pour ${services}...${NC}"
echo -e "${YELLOW}⚠️  Le tunnel sera actif tant que ce script est en cours d'exécution.${NC}"
echo -e "${YELLOW}⚠️  Pour l'arrêter, utilisez Ctrl+C.${NC}"
echo -e "${GREEN}✅ Une fois le tunnel établi, vous pourrez accéder aux services à: ${local_url}${NC}"

# Si on tunnelise PostgreSQL, afficher les informations de connexion
if [[ "$choice" == "3" || "$choice" == "4" ]]; then
  echo -e "\n${YELLOW}Pour vous connecter à PostgreSQL:${NC}"
  echo -e "  Hôte: localhost"
  echo -e "  Port: 5432"
  echo -e "  Base de données: postgres ou supabase"
  echo -e "  Utilisateur: postgres ou supabase_admin"
  echo -e "  Mot de passe: Votre mot de passe PostgreSQL (généralement 'postgres' ou défini lors de l'installation)"
fi

echo -e "\n${BLUE}Démarrage du tunnel SSH...${NC}"
echo -e "${BLUE}$tunnel_cmd${NC}\n"

# Exécuter la commande de tunnel
eval "$tunnel_cmd"