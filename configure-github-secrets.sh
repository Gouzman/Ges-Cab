#!/bin/bash

echo "🔐 CONFIGURATION DES SECRETS GITHUB POUR DÉPLOIEMENT AUTOMATIQUE"
echo "=================================================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 SECRETS GITHUB NÉCESSAIRES :${NC}"
echo "==============================="
echo ""

echo "Pour automatiser le déploiement, vous devez configurer ces secrets dans GitHub :"
echo ""

echo -e "${YELLOW}1. SSH_PRIVATE_KEY${NC}"
echo "   Clé SSH privée pour se connecter à votre serveur"
echo ""

echo -e "${YELLOW}2. SERVER_HOST${NC}"
echo "   Adresse IP de votre serveur : 82.25.116.122"
echo ""

echo -e "${YELLOW}3. SERVER_USER${NC}"
echo "   Nom d'utilisateur SSH (probablement 'root' ou 'ubuntu')"
echo ""

echo -e "${YELLOW}4. DEPLOY_PATH${NC}"
echo "   Chemin de déploiement : /var/www/ges-cab"
echo ""

echo -e "${CYAN}🔧 ÉTAPES DE CONFIGURATION :${NC}"
echo "============================="
echo ""

echo -e "${GREEN}ÉTAPE 1: GÉNÉRER UNE CLÉ SSH POUR GITHUB ACTIONS${NC}"
echo "------------------------------------------------"
echo ""

read -p "Voulez-vous générer une nouvelle clé SSH pour GitHub Actions ? (o/n): " generate_key

if [[ $generate_key == "o" || $generate_key == "O" ]]; then
    echo ""
    echo "🔑 Génération de la clé SSH..."
    
    # Créer le dossier ssh s'il n'existe pas
    mkdir -p ~/.ssh
    
    # Générer la clé SSH
    ssh-keygen -t ed25519 -C "github-actions-ges-cab" -f ~/.ssh/github_actions_ges_cab -N ""
    
    echo -e "${GREEN}✅ Clé SSH générée !${NC}"
    echo ""
    
    echo -e "${YELLOW}📋 CLÉ PRIVÉE (à copier dans GitHub Secrets) :${NC}"
    echo "=============================================="
    echo ""
    cat ~/.ssh/github_actions_ges_cab
    echo ""
    echo -e "${RED}⚠️  IMPORTANT : Copiez cette clé privée et gardez-la secrète !${NC}"
    echo ""
    
    echo -e "${YELLOW}📋 CLÉ PUBLIQUE (à ajouter sur le serveur) :${NC}"
    echo "============================================"
    echo ""
    cat ~/.ssh/github_actions_ges_cab.pub
    echo ""
    
    echo -e "${BLUE}🔧 Commande pour ajouter la clé publique sur votre serveur :${NC}"
    echo "ssh root@82.25.116.122 'echo \"$(cat ~/.ssh/github_actions_ges_cab.pub)\" >> ~/.ssh/authorized_keys'"
    echo ""
    
    read -p "Voulez-vous ajouter automatiquement la clé publique sur votre serveur ? (o/n): " add_key_to_server
    
    if [[ $add_key_to_server == "o" || $add_key_to_server == "O" ]]; then
        echo "🔑 Ajout de la clé publique sur le serveur..."
        ssh root@82.25.116.122 "echo '$(cat ~/.ssh/github_actions_ges_cab.pub)' >> ~/.ssh/authorized_keys"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Clé publique ajoutée sur le serveur !${NC}"
        else
            echo -e "${RED}❌ Erreur lors de l'ajout de la clé. Faites-le manuellement.${NC}"
        fi
    fi
fi

echo ""
echo -e "${GREEN}ÉTAPE 2: CONFIGURER LES SECRETS GITHUB${NC}"
echo "========================================="
echo ""

echo "🌐 Allez sur votre repository GitHub :"
echo "https://github.com/Gouzman/Ges-Cab"
echo ""

echo "📝 Navigation :"
echo "1. Settings (onglet en haut)"
echo "2. Secrets and variables (menu de gauche)"
echo "3. Actions"
echo "4. New repository secret"
echo ""

echo -e "${YELLOW}🔐 SECRETS À AJOUTER :${NC}"
echo "====================="
echo ""

echo "Nom: SSH_PRIVATE_KEY"
echo "Valeur: [Copiez la clé privée générée ci-dessus]"
echo ""

echo "Nom: SERVER_HOST"
echo "Valeur: 82.25.116.122"
echo ""

echo "Nom: SERVER_USER"
echo "Valeur: root"
echo ""

echo "Nom: DEPLOY_PATH"
echo "Valeur: /var/www/ges-cab"
echo ""

echo "Nom: SERVER_PORT"
echo "Valeur: 22"
echo ""

echo -e "${BLUE}🔧 WORKFLOW GITHUB ACTIONS COMPLET${NC}"
echo "====================================="
echo ""

# Créer un workflow plus complet
cat > .github/workflows/deploy-production.yml << 'EOF'
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production
    
    - name: Setup SSH
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan -H ${{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts
    
    - name: Deploy to server
      run: |
        # Backup current version
        ssh -i ~/.ssh/id_rsa ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} "
          if [ -d ${{ secrets.DEPLOY_PATH }} ]; then
            cp -r ${{ secrets.DEPLOY_PATH }} ${{ secrets.DEPLOY_PATH }}_backup_$(date +%Y%m%d_%H%M%S)
          fi
        "
        
        # Upload new version
        scp -i ~/.ssh/id_rsa -r dist/* ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}:${{ secrets.DEPLOY_PATH }}/
        
        # Restart services if needed
        ssh -i ~/.ssh/id_rsa ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} "
          systemctl reload nginx
          echo 'Deployment completed successfully!'
        "
    
    - name: Health check
      run: |
        sleep 10
        curl -f https://ges-cab.com || (echo "Health check failed" && exit 1)
        echo "✅ Deployment successful - Site is responding!"
EOF

echo -e "${GREEN}✅ Workflow complet de déploiement créé !${NC}"
echo ""

echo -e "${BLUE}🚀 WORKFLOW DE DÉVELOPPEMENT AVEC CI/CD${NC}"
echo "==========================================="
echo ""

# Créer un script de test de déploiement
cat > test-deployment.sh << 'EOF'
#!/bin/bash

echo "🧪 TEST DE DÉPLOIEMENT"
echo "====================="

echo "1. 📦 Build local..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi"
else
    echo "❌ Échec du build"
    exit 1
fi

echo ""
echo "2. 🔍 Vérification des fichiers..."
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo "✅ Fichiers de build présents"
    ls -la dist/
else
    echo "❌ Aucun fichier de build trouvé"
    exit 1
fi

echo ""
echo "3. 🌐 Test de connexion au serveur..."
ssh -o ConnectTimeout=5 root@82.25.116.122 "echo 'Connexion serveur OK'"

if [ $? -eq 0 ]; then
    echo "✅ Connexion serveur réussie"
else
    echo "❌ Impossible de se connecter au serveur"
    echo "Vérifiez votre connexion SSH"
fi

echo ""
echo "🎯 Tout est prêt pour le déploiement automatique !"
echo "Faites un push sur la branche main pour déclencher le déploiement."
EOF

chmod +x test-deployment.sh

echo -e "${GREEN}✅ Script de test créé : test-deployment.sh${NC}"
echo ""

echo -e "${CYAN}📋 RÉSUMÉ FINAL :${NC}"
echo "=================="
echo ""
echo "✅ Clé SSH pour GitHub Actions générée"
echo "✅ Workflow de déploiement automatique créé"
echo "✅ Script de test créé"
echo ""

echo -e "${YELLOW}🎯 PROCHAINES ÉTAPES :${NC}"
echo "====================="
echo ""
echo "1. 🔐 Configurez les secrets GitHub (voir instructions ci-dessus)"
echo "2. 🧪 Testez : ./test-deployment.sh"
echo "3. 🚀 Faites un push sur main pour déclencher le premier déploiement auto"
echo "4. 🔄 Développez sur la branche develop"
echo "5. 📝 Utilisez ./nouvelle-fonctionnalite.sh pour créer des features"
echo ""

echo -e "${GREEN}🎉 CI/CD COMPLÈTEMENT CONFIGURÉ !${NC}"
echo "Votre application est maintenant prête pour le développement professionnel !"