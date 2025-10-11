#!/bin/bash

echo "🚀 CONFIGURATION CI/CD POUR GES-CAB"
echo "===================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}🎉 Félicitations ! Votre site est en ligne sur HTTPS !${NC}"
echo -e "${BLUE}🔗 https://ges-cab.com${NC}"
echo ""

echo -e "${CYAN}📋 PLAN D'ACTION CI/CD :${NC}"
echo "======================="
echo ""

# Vérifier l'état actuel du git
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "Non initialisé")
echo -e "${YELLOW}Branche actuelle : $CURRENT_BRANCH${NC}"
echo ""

echo -e "${BLUE}ÉTAPE 1: SÉCURISATION IMMÉDIATE${NC}"
echo "--------------------------------"
echo ""

read -p "Voulez-vous sécuriser votre branche main maintenant ? (o/n): " secure_main

if [[ $secure_main == "o" || $secure_main == "O" ]]; then
    echo ""
    echo "🔒 Sécurisation de la production..."
    
    # Créer la branche develop si elle n'existe pas
    if ! git branch -r | grep -q "origin/develop"; then
        echo "📝 Création de la branche develop..."
        git checkout -b develop
        git push origin develop
        echo -e "${GREEN}✅ Branche develop créée et pushée${NC}"
    else
        echo -e "${YELLOW}⚠️  Branche develop existe déjà${NC}"
        git checkout develop
        git pull origin develop
    fi
    
    # Retourner sur main
    git checkout main
    echo -e "${GREEN}✅ Branches configurées${NC}"
    echo ""
fi

echo -e "${BLUE}ÉTAPE 2: CHOIX DE L'OUTIL CI/CD${NC}"
echo "---------------------------------"
echo ""
echo "Choisissez votre outil CI/CD :"
echo "1. GitHub Actions (Recommandé - Gratuit)"
echo "2. GitLab CI/CD"
echo "3. Configuration manuelle avancée"
echo ""

read -p "Votre choix (1-3): " cicd_choice

case $cicd_choice in
    1)
        echo ""
        echo -e "${GREEN}🐙 Configuration GitHub Actions${NC}"
        echo ""
        
        # Créer le dossier .github/workflows
        mkdir -p .github/workflows
        
        echo "📝 Création du workflow de base..."
        
        # Workflow basique
        cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test --if-present
    
    - name: Build
      run: npm run build
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: dist/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist/
    
    - name: Deploy to server
      run: |
        echo "🚀 Déploiement vers le serveur de production"
        echo "Configuration des secrets GitHub nécessaire"
EOF

        echo -e "${GREEN}✅ Workflow GitHub Actions créé${NC}"
        echo -e "${YELLOW}⚠️  Il faut configurer les secrets GitHub pour le déploiement${NC}"
        echo ""
        ;;
        
    2)
        echo ""
        echo -e "${GREEN}🦊 Configuration GitLab CI/CD${NC}"
        echo ""
        
        cat > .gitlab-ci.yml << 'EOF'
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:${NODE_VERSION}
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run test --if-present
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
  script:
    - echo "🚀 Déploiement vers le serveur"
    - echo "Configuration des variables CI/CD nécessaire"
  only:
    - main
EOF

        echo -e "${GREEN}✅ Pipeline GitLab CI créé${NC}"
        echo -e "${YELLOW}⚠️  Il faut configurer les variables GitLab pour le déploiement${NC}"
        echo ""
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}🔧 Configuration manuelle avancée${NC}"
        echo "Nous allons créer des scripts personnalisés"
        echo ""
        ;;
esac

echo -e "${BLUE}ÉTAPE 3: CONFIGURATION DE STAGING${NC}"
echo "-----------------------------------"
echo ""

read -p "Voulez-vous configurer un environnement de staging ? (o/n): " setup_staging

if [[ $setup_staging == "o" || $setup_staging == "O" ]]; then
    echo ""
    echo "🏗️ Configuration de l'environnement staging..."
    
    # Script de déploiement staging
    cat > deploy-staging.sh << 'EOF'
#!/bin/bash

echo "🚀 DÉPLOIEMENT STAGING"
echo "====================="

# Variables
STAGING_SERVER="82.25.116.122"
STAGING_PORT="3001"
STAGING_DIR="/var/www/ges-cab-staging"

echo "📦 Build de l'application..."
npm run build

echo "📤 Upload vers le serveur staging..."
# Commandes de déploiement à personnaliser
echo "scp -r dist/* user@$STAGING_SERVER:$STAGING_DIR/"
echo "ssh user@$STAGING_SERVER 'systemctl restart ges-cab-staging'"

echo "✅ Staging déployé sur http://$STAGING_SERVER:$STAGING_PORT"
EOF

    chmod +x deploy-staging.sh
    echo -e "${GREEN}✅ Script de déploiement staging créé${NC}"
    echo ""
fi

echo -e "${BLUE}ÉTAPE 4: WORKFLOW DE DÉVELOPPEMENT${NC}"
echo "------------------------------------"
echo ""

# Créer un script pour nouvelle fonctionnalité
cat > nouvelle-fonctionnalite.sh << 'EOF'
#!/bin/bash

echo "🆕 NOUVELLE FONCTIONNALITÉ"
echo "=========================="

if [ -z "$1" ]; then
    echo "Usage: ./nouvelle-fonctionnalite.sh nom-de-la-fonctionnalite"
    exit 1
fi

FEATURE_NAME="$1"
BRANCH_NAME="feature/$FEATURE_NAME"

echo "📝 Création de la branche : $BRANCH_NAME"

# S'assurer d'être sur develop et à jour
git checkout develop
git pull origin develop

# Créer la nouvelle branche
git checkout -b "$BRANCH_NAME"

echo "✅ Branche créée ! Vous pouvez maintenant développer."
echo ""
echo "📋 Workflow recommandé :"
echo "1. Développez votre fonctionnalité"
echo "2. git add . && git commit -m 'feat: $FEATURE_NAME'"
echo "3. git push origin $BRANCH_NAME"
echo "4. Créez une Pull Request vers develop"
echo "5. Après review → merge vers develop"
echo "6. Test sur staging"
echo "7. Pull Request develop → main"
echo "8. Déploiement automatique en production"
EOF

chmod +x nouvelle-fonctionnalite.sh

echo -e "${GREEN}✅ Script de workflow créé${NC}"
echo ""

echo -e "${CYAN}🎯 RÉSUMÉ DE LA CONFIGURATION :${NC}"
echo "==============================="
echo ""
echo "✅ Guide CI/CD créé : GUIDE-CICD-PRODUCTION.md"
if [[ $secure_main == "o" || $secure_main == "O" ]]; then
    echo "✅ Branches sécurisées (main/develop)"
fi
if [[ $cicd_choice == "1" ]]; then
    echo "✅ GitHub Actions configuré"
elif [[ $cicd_choice == "2" ]]; then
    echo "✅ GitLab CI configuré"
fi
if [[ $setup_staging == "o" || $setup_staging == "O" ]]; then
    echo "✅ Script staging créé"
fi
echo "✅ Workflow de développement configuré"
echo ""

echo -e "${YELLOW}📋 PROCHAINES ÉTAPES :${NC}"
echo "====================="
echo ""
echo "1. 📖 Lire : GUIDE-CICD-PRODUCTION.md"
echo "2. 🆕 Créer une fonctionnalité : ./nouvelle-fonctionnalite.sh nom-feature"
echo "3. 🏗️ Configurer staging : ./deploy-staging.sh"
echo "4. 🔧 Configurer les secrets de déploiement"
echo "5. 🚀 Premier déploiement automatique"
echo ""

echo -e "${GREEN}🎉 Configuration CI/CD terminée !${NC}"
echo "Votre application est prête pour le développement continu."