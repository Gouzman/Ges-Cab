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
