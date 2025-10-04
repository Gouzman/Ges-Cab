#!/bin/bash

echo "Vérification de la structure de la base de données..."

# Charger les variables d'environnement
source .env.local

# Liste des tables requises
required_tables=(
  "users"
  "cases"
  "tasks"
  "calendar_events"
  "invoices"
  "clients"
  "user_permissions"
  "app_metadata"
)

# Vérifier chaque table
for table in "${required_tables[@]}"; do
  echo "Vérification de la table $table..."
  psql -U "$VITE_POSTGRES_USER" -h "$VITE_POSTGRES_HOST" -d "$VITE_POSTGRES_DATABASE" -t -c "\d $table"
done