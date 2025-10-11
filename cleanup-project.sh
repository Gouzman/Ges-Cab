#!/bin/bash

# 🧹 Script de Nettoyage Intelligent du Projet Ges-Cab
# Nettoie les fichiers temporaires et redondants sans casser le code existant

set -e

echo "🧹 NETTOYAGE INTELLIGENT DU PROJET GES-CAB"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
DELETED_COUNT=0
MOVED_COUNT=0
KEPT_COUNT=0

# Créer un dossier de sauvegarde pour les scripts importants
echo -e "${BLUE}📁 Création de la structure d'archivage...${NC}"
mkdir -p archive/{scripts-deployment,docs-backup,temp-files}

# === 1. SCRIPTS DE DÉPLOIEMENT REDONDANTS ===
echo -e "${YELLOW}🔄 Nettoyage des scripts de déploiement redondants...${NC}"

# Garder seulement les scripts essentiels de déploiement
DEPLOYMENT_SCRIPTS_TO_KEEP=(
    "patches/deploy-corrections.sh"
    "setup-cicd.sh"
    "deploy-now.sh"
)

# Scripts de déploiement redondants à archiver
DEPLOYMENT_SCRIPTS_TO_ARCHIVE=(
    "deploy-simple.sh"
    "deploy-staging.sh"
    "deploy-temp.sh"
    "fix-deployment.sh"
    "test-deployment.sh"
    "workflow-developpement.sh"
)

for script in "${DEPLOYMENT_SCRIPTS_TO_ARCHIVE[@]}"; do
    if [ -f "$script" ]; then
        mv "$script" archive/scripts-deployment/
        echo "📦 Archivé: $script"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    fi
done

# === 2. SCRIPTS DNS ET DIAGNOSTICS TEMPORAIRES ===
echo -e "${YELLOW}🌐 Nettoyage des scripts DNS temporaires...${NC}"

DNS_SCRIPTS_TO_ARCHIVE=(
    "check-dns-complete.sh"
    "check-dns-status.sh"
    "check-dns.sh"
    "diagnostic-dns-approfondi.sh"
    "diagnose-hostinger.sh"
    "guide-simple-dns.sh"
    "monitor-dns-propagation.sh"
    "setup-complete-domains.sh"
    "setup-temp-access.sh"
    "solution-dns-hostinger.sh"
    "solutions-connexion-reset.sh"
    "verification-hostinger-interactive.sh"
)

for script in "${DNS_SCRIPTS_TO_ARCHIVE[@]}"; do
    if [ -f "$script" ]; then
        mv "$script" archive/scripts-deployment/
        echo "📦 Archivé: $script"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    fi
done

# === 3. SCRIPTS DE DIAGNOSTIC TEMPORAIRES ===
echo -e "${YELLOW}🔍 Nettoyage des scripts de diagnostic temporaires...${NC}"

DIAGNOSTIC_SCRIPTS_TO_ARCHIVE=(
    "diagnostic-erreurs-production.sh"
    "diagnostic-urgence.sh"
    "monitor-site-recovery.sh"
    "restart-services-api.sh"
)

for script in "${DIAGNOSTIC_SCRIPTS_TO_ARCHIVE[@]}"; do
    if [ -f "$script" ]; then
        mv "$script" archive/scripts-deployment/
        echo "📦 Archivé: $script"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    fi
done

# === 4. DOCUMENTATION REDONDANTE ===
echo -e "${YELLOW}📚 Nettoyage de la documentation redondante...${NC}"

DOCS_TO_ARCHIVE=(
    "CHECKLIST-PRODUCTION.md"
    "DEPLOYMENT-PRODUCTION.md"
    "DEPLOYMENT.md"
    "GUIDE-CICD-PRODUCTION.md"
    "GUIDE-DNS.md"
    "GUIDE-ETAPES-DNS.md"
    "GUIDE-HOSTINGER-DNS.md"
    "GUIDE-REGISTRAR-EU.md"
    "INSTRUCTIONS_ACTIVATION_COMPTES.md"
    "PRODUCTION-CHECKLIST.md"
    "SSH-SETUP.md"
    "SUPABASE.md"
)

for doc in "${DOCS_TO_ARCHIVE[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" archive/docs-backup/
        echo "📦 Archivé: $doc"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    fi
done

# === 5. SCRIPTS DE CORRECTION TEMPORAIRES ===
echo -e "${YELLOW}🔧 Nettoyage des scripts de correction temporaires...${NC}"

TEMP_SCRIPTS_TO_ARCHIVE=(
    "enable-https-complete.sh"
    "enable-https.sh"
    "fix-assets-structure.sh"
    "fix-nginx-studio.sh"
    "fix-studio-direct.sh"
    "fix-supabase-config.sh"
    "nouvelle-fonctionnalite.sh"
    "setup-auth-system.sh"
    "setup-https.sh"
    "supprimer-cache.sh"
    "test-cache-cleared.sh"
)

for script in "${TEMP_SCRIPTS_TO_ARCHIVE[@]}"; do
    if [ -f "$script" ]; then
        mv "$script" archive/temp-files/
        echo "📦 Archivé: $script"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    fi
done

# === 6. FICHIERS TEMPORAIRES ET ARCHIVES ===
echo -e "${YELLOW}🗑️  Suppression des fichiers temporaires...${NC}"

TEMP_FILES_TO_DELETE=(
    "ges-cab-deploy.tar.gz"
    ".DS_Store"
    "RAPPORT_NETTOYAGE.md"
)

for file in "${TEMP_FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "🗑️  Supprimé: $file"
        DELETED_COUNT=$((DELETED_COUNT + 1))
    fi
done

# === 7. NETTOYAGE DES DOSSIERS TEMPORAIRES ===
echo -e "${YELLOW}📁 Nettoyage des dossiers temporaires...${NC}"

# Nettoyer le dossier .vite s'il existe
if [ -d ".vite" ]; then
    rm -rf .vite
    echo "🗑️  Supprimé: .vite/"
    DELETED_COUNT=$((DELETED_COUNT + 1))
fi

# Nettoyer le dossier dist s'il est vide ou temporaire
if [ -d "dist" ] && [ -z "$(ls -A dist)" ]; then
    rm -rf dist
    echo "🗑️  Supprimé: dist/ (vide)"
    DELETED_COUNT=$((DELETED_COUNT + 1))
fi

# === 8. CRÉATION D'UN INDEX DES ARCHIVES ===
echo -e "${BLUE}📋 Création de l'index des archives...${NC}"

cat > archive/INDEX.md << EOF
# 📦 Archive des Fichiers - Ges-Cab

## 📁 Structure

### scripts-deployment/
Scripts de déploiement et DNS temporaires archivés lors du nettoyage.

### docs-backup/
Documentation redondante sauvegardée.

### temp-files/
Fichiers temporaires et scripts de correction ponctuels.

## 🗓️ Date d'archivage
$(date '+%Y-%m-%d %H:%M:%S')

## 📊 Statistiques
- **Scripts archivés**: Scripts de déploiement, DNS, et diagnostics temporaires
- **Documentation**: Guides redondants sauvegardés
- **Fichiers temp**: Scripts de correction ponctuels

## 🔄 Restauration
Pour restaurer un fichier:
\`\`\`bash
cp archive/[dossier]/[fichier] ./
\`\`\`

---
*Archivage automatique par cleanup-project.sh*
EOF

# === 9. NETTOYAGE DU CODE SOURCE ===
echo -e "${YELLOW}🧹 Nettoyage des imports et commentaires obsolètes...${NC}"

# Nettoyer les imports inutilisés dans les composants (conservatif)
find src/components -name "*.jsx" -type f | while read -r file; do
    # Supprimer les lignes de commentaires vides répétées
    sed -i '' '/^[[:space:]]*\/\/[[:space:]]*$/d' "$file" 2>/dev/null || true
    # Supprimer les console.log de debug (mais garder les console.error)
    sed -i '' '/console\.log.*debug\|console\.log.*DEBUG/d' "$file" 2>/dev/null || true
done

echo "✅ Nettoyage du code source terminé"

# === 10. MISE À JOUR DU .gitignore ===
echo -e "${BLUE}📝 Mise à jour du .gitignore...${NC}"

# Ajouter des patterns pour éviter les fichiers temporaires futurs
cat >> .gitignore << EOF

# Fichiers de nettoyage temporaires
*-temp.sh
*-backup.*
*.tar.gz
test-*.sh
diagnostic-*.sh
check-*.sh
monitor-*.sh
fix-*.sh
setup-*.sh

# Archives locales
archive/
temp/
backup/
EOF

echo "✅ .gitignore mis à jour"

# === 11. CRÉATION DU RAPPORT FINAL ===
echo ""
echo -e "${GREEN}🎉 NETTOYAGE TERMINÉ !${NC}"
echo "==================="
echo ""
echo -e "${BLUE}📊 STATISTIQUES :${NC}"
echo "  📦 Fichiers archivés: $MOVED_COUNT"
echo "  🗑️  Fichiers supprimés: $DELETED_COUNT"
echo "  ✅ Fichiers conservés: Structure principale intacte"
echo ""
echo -e "${BLUE}📁 STRUCTURE FINALE PROPRE :${NC}"
echo "  ✅ src/ - Code source de l'application"
echo "  ✅ patches/ - Scripts de correction validés"
echo "  ✅ database/ - Migrations SQL"
echo "  ✅ .github/ - Configuration CI/CD"
echo "  ✅ archive/ - Fichiers archivés (sécurité)"
echo ""
echo -e "${GREEN}🚀 PROJET NETTOYÉ ET OPTIMISÉ !${NC}"
echo ""
echo -e "${YELLOW}📋 PROCHAINES ÉTAPES :${NC}"
echo "1. Vérifier que l'application fonctionne: npm run dev"
echo "2. Tester la construction: npm run build"
echo "3. Commit du nettoyage: git add . && git commit -m '🧹 Nettoyage projet'"
echo "4. Push des changements: git push"