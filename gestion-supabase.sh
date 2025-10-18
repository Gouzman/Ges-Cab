#!/bin/bash
# Menu principal pour les outils de gestion de connexion Supabase

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}       OUTILS DE GESTION CONNEXION SUPABASE       ${NC}"
echo -e "${BLUE}==================================================${NC}"

echo -e "\n${YELLOW}Sélectionnez une option :${NC}"
echo -e "1) ${GREEN}Test de connectivité${NC} - Vérifier la connexion aux services Supabase"
echo -e "2) ${GREEN}Correction automatique locale${NC} - Résoudre les problèmes sans SSH"
echo -e "3) ${GREEN}Tunnel SSH${NC} - Créer un tunnel sécurisé vers les services Supabase"
echo -e "4) ${GREEN}Reconstruire l'application${NC} - Reconstruire l'app avec la nouvelle configuration"
echo -e "5) ${GREEN}Arrêter tous les tunnels${NC} - Fermer tous les tunnels SSH actifs"
echo -e "q) ${YELLOW}Quitter${NC}"

read -p "Votre choix : " option

case $option in
  1)
    # Test de connectivité
    echo -e "\n${BLUE}Test de connectivité en cours...${NC}"
    ./local-test-supabase.sh
    ;;
    
  2)
    # Correction automatique locale
    echo -e "\n${BLUE}Correction automatique en cours...${NC}"
    ./auto-fix-connection.sh
    ;;
    
  3)
    # Tunnel SSH
    echo -e "\n${BLUE}Configuration du tunnel SSH...${NC}"
    ./create-supabase-ssh-tunnel.sh
    ;;
    
  4)
    # Reconstruire l'application
    echo -e "\n${BLUE}Reconstruction de l'application...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
      echo -e "\n${GREEN}✅ Application reconstruite avec succès !${NC}"
      echo -e "${YELLOW}ℹ️  Vous pouvez maintenant tester l'application avec 'npm run preview'${NC}"
    else
      echo -e "\n${RED}❌ Erreur lors de la reconstruction de l'application.${NC}"
    fi
    ;;
    
  5)
    # Arrêter tous les tunnels
    echo -e "\n${BLUE}Arrêt de tous les tunnels SSH...${NC}"
    # Trouver tous les processus SSH de tunneling
    tunnels=$(ps aux | grep "ssh -o StrictHostKeyChecking=no -p 22 -L" | grep -v grep | awk '{print $2}')
    
    if [ -z "$tunnels" ]; then
      echo -e "${YELLOW}ℹ️  Aucun tunnel SSH actif trouvé.${NC}"
    else
      echo -e "${YELLOW}Tunnels trouvés : $tunnels${NC}"
      
      # Arrêter chaque tunnel
      for pid in $tunnels; do
        echo -e "Arrêt du tunnel SSH avec PID $pid..."
        kill $pid
      done
      
      echo -e "${GREEN}✅ Tous les tunnels SSH ont été arrêtés !${NC}"
    fi
    ;;
    
  q|Q)
    echo -e "\n${BLUE}Au revoir !${NC}"
    exit 0
    ;;
    
  *)
    echo -e "\n${RED}❌ Option invalide.${NC}"
    exit 1
    ;;
esac

echo -e "\n${BLUE}==================================================${NC}"
echo -e "${YELLOW}Appuyez sur ENTRÉE pour revenir au menu principal ou CTRL+C pour quitter...${NC}"
read

# Relancer ce script
exec $0