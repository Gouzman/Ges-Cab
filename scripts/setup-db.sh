#!/bin/bash

# Charger les variables d'environnement
source .env

# Créer la base de données
echo "Création de la base de données..."
psql -U $VITE_POSTGRES_USER -h $VITE_POSTGRES_HOST -c "CREATE DATABASE $VITE_POSTGRES_DATABASE;"

# Exécuter le script de schéma
echo "Configuration du schéma..."
psql -U $VITE_POSTGRES_USER -h $VITE_POSTGRES_HOST -d $VITE_POSTGRES_DATABASE -f db/schema.sql

echo "Base de données configurée avec succès!"