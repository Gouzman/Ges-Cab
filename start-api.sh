#!/bin/bash

# Script pour démarrer l'API backend en développement

echo "🚀 Démarrage de l'API Backend PostgreSQL..."
echo "📍 Port: 3003"
echo "📊 Health check: http://localhost:3003/api/health"

# Charger le fichier .env depuis le répertoire racine
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

cd backend

# Utiliser les variables d'environnement du projet parent et les mapper pour l'API
export PG_USER=${VITE_PG_USER:-nascentia}
export PG_HOST=${VITE_PG_HOST:-localhost}
export PG_DATABASE=${VITE_PG_DATABASE:-ges_cab}
export PG_PASSWORD=${VITE_PG_PASSWORD:-}
export PG_PORT=${VITE_PG_PORT:-5432}
export PORT=3003

# Vérifier que PostgreSQL est accessible
echo "🔍 Vérification de la connexion PostgreSQL..."
if ! pg_isready -h ${VITE_PG_HOST} -p ${VITE_PG_PORT} -U ${VITE_PG_USER} >/dev/null 2>&1; then
    echo "❌ PostgreSQL n'est pas accessible. Veuillez vérifier la configuration."
    exit 1
fi

echo "✅ PostgreSQL accessible"

# Démarrer l'API
echo "🔄 Démarrage du serveur..."
node api-server.js