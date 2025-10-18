#!/bin/bash

# 🧹 Script de Nettoyage Intelligent du Projet Ges-Cab (Version Mise à Jour)
# Nettoie les fichiers temporaires et redondants sans casser le code existant

set -e

echo "🧹 NETTOYAGE INTELLIGENT DU PROJET GES-CAB (Version Mise à Jour)"
echo "=============================================================="
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

# Créer une structure d'archivage
echo -e "${BLUE}📁 Création de la structure d'archivage...${NC}"
mkdir -p archive/{scripts-supabase,scripts-deployment,tests,configs-backup,docs}

# === 1. FICHIERS DE CONFIGURATION ENV REDONDANTS ===
echo -e "${YELLOW}⚙️  Nettoyage des fichiers .env redondants...${NC}"

ENV_FILES_TO_KEEP=(
    ".env"
    ".env.production"
    ".env.local"
    ".env.production.example"
)

# Archiver tous les autres fichiers .env
find . -maxdepth 1 -name ".env*" | while read -r file; do
    base_file=$(basename "$file")
    if [[ ! " ${ENV_FILES_TO_KEEP[@]} " =~ " ${base_file} " ]]; then
        mv "$file" archive/configs-backup/
        echo "📦 Archivé: $file"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        echo "✅ Conservé: $file"
        KEPT_COUNT=$((KEPT_COUNT + 1))
    fi
done

# === 2. SCRIPTS SUPABASE REDONDANTS ===
echo -e "${YELLOW}🔄 Archivage des scripts Supabase redondants...${NC}"

# Scripts Supabase essentiels à conserver
SUPABASE_SCRIPTS_TO_KEEP=(
    "create-admin-account.sh"
    "create-user-account.sh"
    "create-supabase-ssh-tunnel.sh"
    "gestion-supabase.sh"
    "setup-db-connection.sh"
)

# Scripts Supabase à archiver
SUPABASE_SCRIPTS_TO_ARCHIVE=(
    "check-api-config.sh"
    "check-nginx-status.sh"
    "check-server-supabase.sh"
    "check-ssl-cert.sh"
    "check-supabase-installation.sh"
    "check-supabase-status.sh"
    "configure-api-subdomain.sh"
    "configure-db-connection.sh"
    "configure-nginx-for-api.sh"
    "configure-nginx-redirect.sh"
    "deploy-api-update.sh"
    "deploy-self-hosted-supabase.sh"
    "diagnose-studio-access.sh"
    "find-anon-key.sh"
    "fix-api-config.sh"
    "fix-nginx-complete.sh"
    "fix-nginx-conflicts.sh"
    "fix-nginx-supabase.sh"
    "fix-studio-subdomain.sh"
    "fix-supabase-stack-guards.sh"
    "install-db-dependencies.sh"
    "install-supabase.sh"
    "migrate-supabase-data.sh"
    "reset-supabase-password.sh"
    "test-supabase-api.sh"
    "update-env-config.sh"
    "update-env-with-key.sh"
    "update-ssl-cert.sh"
    "update-supabase-api-config.sh"
    "auto-fix-connection.sh"
    "auto-fix-supabase-connection.sh"
    "apply-ssl-fix.sh"
    "db-tunnel.sh"
    "get-db-connection-info.sh"
    "get-supabase-access.sh"
)

for script in "${SUPABASE_SCRIPTS_TO_ARCHIVE[@]}"; do
    if [ -f "$script" ]; then
        mv "$script" archive/scripts-supabase/
        echo "📦 Archivé: $script"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    fi
done

# === 3. SCRIPTS DE TEST ===
echo -e "${YELLOW}🧪 Archivage des scripts de test...${NC}"

TEST_SCRIPTS_TO_ARCHIVE=(
    "test-supabase-connection.sh"
    "local-test-supabase.sh"
    "test-supabase-connection.js"
)

for script in "${TEST_SCRIPTS_TO_ARCHIVE[@]}"; do
    if [ -f "$script" ]; then
        mv "$script" archive/tests/
        echo "📦 Archivé: $script"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    fi
done

# === 4. FICHIERS HTML DE TEST ===
echo -e "${YELLOW}🌐 Archivage des fichiers HTML de test...${NC}"

HTML_FILES_TO_ARCHIVE=(
    "test-supabase-connection.html"
    "test-supabase-interactive.html"
    "create-user-guide.html"
)

for html in "${HTML_FILES_TO_ARCHIVE[@]}"; do
    if [ -f "$html" ]; then
        mv "$html" archive/tests/
        echo "📦 Archivé: $html"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    fi
done

# === 5. DOCUMENTATION REDONDANTE ===
echo -e "${YELLOW}📚 Archivage de la documentation redondante...${NC}"

# Documentation à conserver
DOCS_TO_KEEP=(
    "README_MIGRATION.md"
    "SECURITY.md"
    "DEPLOY-NOW.md"
    "DEPLOYMENT_LOG.md"
)

# Documentation à archiver
DOCS_TO_ARCHIVE=(
    "DB_CONNECTION_GUIDE.md"
    "db-connection-instructions.md"
    "DOCUMENTATION_MIGRATION_SUPABASE.md"
    "README_DB_CONNECTION.md"
    "RAPPORT_CORRECTION_CLES_REACT.md"
    "RAPPORT_GITHUB_ACTIONS_UPDATE.md"
    "RAPPORT-NETTOYAGE-FINAL.md"
    "RESUME-CORRECTIONS-PRODUCTION.md"
    "GUIDE_TEST_AUTHENTIFICATION_CONTROLEE.md"
    "GUIDE_TEST_CORRECTIONS.md"
    "GUIDE-TEST-AUTH.md"
    "FORGOT_PASSWORD_TEST.md"
    "PRODUCTION_DEPLOYMENT_SUCCESS.md"
    "AUTHENTICATION_CONTROLLED_FLOW.md" 
    "AUTHENTICATION_FLOW.md"
    "EMAIL_CONFIRMATION_SYSTEM.md"
)

for doc in "${DOCS_TO_ARCHIVE[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" archive/docs/
        echo "📦 Archivé: $doc"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    fi
done

# === 6. FICHIERS TEMPORAIRES ===
echo -e "${YELLOW}🗑️  Suppression des fichiers temporaires...${NC}"

TEMP_FILES_TO_DELETE=(
    "gescab-deploy.tar.gz"
    ".DS_Store"
)

for file in "${TEMP_FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "🗑️  Supprimé: $file"
        DELETED_COUNT=$((DELETED_COUNT + 1))
    fi
done

# === 7. CRÉATION D'UN INDEX DES ARCHIVES ===
echo -e "${BLUE}📋 Création de l'index des archives...${NC}"

cat > archive/INDEX.md << EOF
# 📦 Archive des Fichiers - Ges-Cab

## 📁 Structure

### scripts-supabase/
Scripts de configuration et de dépannage Supabase archivés

### scripts-deployment/
Scripts de déploiement temporaires archivés

### tests/
Scripts et fichiers de test pour la connectivité et les fonctionnalités

### configs-backup/
Configurations et fichiers .env de backup

### docs/
Documentation technique archivée

## 🗓️ Date d'archivage
$(date '+%Y-%m-%d %H:%M:%S')

## 📊 Statistiques
- **Scripts archivés**: $MOVED_COUNT
- **Fichiers supprimés**: $DELETED_COUNT
- **Fichiers conservés**: $KEPT_COUNT

## 🔄 Restauration
Pour restaurer un fichier:
\`\`\`bash
cp archive/[dossier]/[fichier] ./
\`\`\`

---
*Archivage automatique par cleanup-project-updated.sh*
EOF

# === 8. MISE À JOUR DU .gitignore ===
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

# Archives locales
archive/
temp/
backup/
EOF

echo "✅ .gitignore mis à jour"

# === 9. CRÉATION DU RAPPORT FINAL ===
echo ""
echo -e "${GREEN}🎉 NETTOYAGE TERMINÉ !${NC}"
echo "==================="
echo ""
echo -e "${BLUE}📊 STATISTIQUES :${NC}"
echo "  📦 Fichiers archivés: $MOVED_COUNT"
echo "  🗑️  Fichiers supprimés: $DELETED_COUNT"
echo "  ✅ Fichiers conservés: $KEPT_COUNT"
echo ""
echo -e "${BLUE}📁 STRUCTURE FINALE PROPRE :${NC}"
echo "  ✅ src/ - Code source de l'application"
echo "  ✅ supabase/ - Configuration Supabase"
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