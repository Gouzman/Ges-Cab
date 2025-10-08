#!/bin/bash

# Script de préparation pour la production - Ges-Cab
# Automatise toutes les vérifications et optimisations nécessaires

echo "🚀 PRÉPARATION GES-CAB POUR LA PRODUCTION"
echo "========================================"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage avec couleurs
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
print_step "Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi

print_success "Node.js et npm sont installés"

# Installation des dépendances
print_step "Installation des dépendances..."
npm ci --production=false
print_success "Dépendances installées"

# Vérification des variables d'environnement
print_step "Vérification des variables d'environnement..."

if [ ! -f ".env.local" ]; then
    print_error "Fichier .env.local manquant"
    print_warning "Créez le fichier .env.local avec vos variables Supabase"
    exit 1
fi

# Vérifier que les variables essentielles sont présentes
if ! grep -q "VITE_SUPABASE_URL" .env.local; then
    print_error "VITE_SUPABASE_URL manquant dans .env.local"
    exit 1
fi

if ! grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
    print_error "VITE_SUPABASE_ANON_KEY manquant dans .env.local"
    exit 1
fi

print_success "Variables d'environnement OK"

# Audit de sécurité
print_step "Audit de sécurité..."
npm audit --audit-level moderate
if [ $? -ne 0 ]; then
    print_warning "Vulnérabilités détectées, corrigez-les avec: npm audit fix"
fi
print_success "Audit de sécurité terminé"

# Analyse de code avec ESLint
print_step "Analyse de code avec ESLint..."
npx eslint src/ --ext .js,.jsx --max-warnings 0
if [ $? -ne 0 ]; then
    print_error "Erreurs ESLint détectées, corrigez-les avant de continuer"
    exit 1
fi
print_success "Code ESLint conforme"

# Tests (si présents)
if [ -f "src/__tests__" ] || [ -f "tests/" ]; then
    print_step "Exécution des tests..."
    npm test -- --watchAll=false
    if [ $? -ne 0 ]; then
        print_error "Tests échoués"
        exit 1
    fi
    print_success "Tests passés"
fi

# Build de production
print_step "Build de production..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Échec du build de production"
    exit 1
fi
print_success "Build de production réussi"

# Vérification de la taille du bundle
print_step "Analyse de la taille du bundle..."
if command -v du &> /dev/null; then
    BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
    print_success "Taille du bundle: $BUNDLE_SIZE"
fi

# Génération du fichier llms.txt
print_step "Génération de la documentation..."
node tools/generate-llms.js
print_success "Documentation générée"

# Test du build en local
print_step "Test du build en local..."
timeout 10 npm run preview &
PREVIEW_PID=$!
sleep 3

if curl -f http://localhost:4173 > /dev/null 2>&1; then
    print_success "Build fonctionne en local"
else
    print_warning "Impossible de tester le build en local"
fi

kill $PREVIEW_PID 2>/dev/null

# Recommandations finales
echo ""
echo "🎯 RECOMMANDATIONS POUR LA PRODUCTION:"
echo "======================================"
echo "1. 🔐 Configurez HTTPS sur votre serveur"
echo "2. 🌐 Configurez un nom de domaine"
echo "3. 📊 Activez la compression gzip/brotli"
echo "4. 🚀 Utilisez un CDN pour les assets statiques"
echo "5. 📈 Configurez la surveillance (monitoring)"
echo "6. 🔄 Mettez en place des sauvegardes automatiques"
echo "7. 🛡️  Configurez un firewall"
echo ""

print_success "Projet prêt pour la production!"
echo -e "${BLUE}📁 Dossier de build: ./dist/${NC}"
echo -e "${BLUE}🚀 Vous pouvez maintenant déployer le contenu du dossier 'dist' sur votre serveur${NC}"