#!/bin/bash

# Script de seed des utilisateurs pour Ges-Cab
# Usage: ./seed-users.sh [sql|js|info]

echo "🌱 Seed utilisateurs Ges-Cab"
echo "============================"

# Fonction d'aide
show_help() {
    echo "Usage: ./seed-users.sh [option]"
    echo ""
    echo "Options:"
    echo "  sql     Exécuter le script SQL direct"
    echo "  js      Exécuter le script JavaScript (via service auth)"
    echo "  info    Afficher les informations de connexion"
    echo "  help    Afficher cette aide"
    echo ""
    echo "Par défaut: utilise le script JavaScript"
}

# Vérifier les arguments
case "${1:-js}" in
    "help"|"-h"|"--help")
        show_help
        exit 0
        ;;
    "info")
        echo "🔐 Informations de connexion Ges-Cab"
        echo "====================================="
        echo ""
        echo "ADMINISTRATEUR :"
        echo "  Email        : elie.gouzou@gmail.com"
        echo "  Mot de passe : admin123"
        echo "  Rôle         : admin"
        echo ""
        echo "UTILISATEURS TEST (première connexion) :"
        echo "  avocat.test@ges-cab.local     → TEMP2024"
        echo "  secretaire.test@ges-cab.local → SECRET2024"  
        echo "  stagiaire.test@ges-cab.local  → STAGE2024"
        echo ""
        echo "💡 Les mots de passe temporaires doivent être changés"
        echo "   lors de la première connexion."
        exit 0
        ;;
    "sql")
        echo "📄 Exécution du script SQL..."
        
        # Vérifier que PostgreSQL est accessible
        if ! psql -h localhost -U gouzman -d ges_cab -c "SELECT 1;" >/dev/null 2>&1; then
            echo "❌ Impossible de se connecter à PostgreSQL"
            echo "💡 Vérifiez que PostgreSQL est démarré et que la base ges_cab existe"
            exit 1
        fi
        
        # Exécuter le script SQL
        psql -h localhost -U gouzman -d ges_cab -f database/seed-users.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Script SQL exécuté avec succès"
        else
            echo "❌ Erreur lors de l'exécution du script SQL"
            exit 1
        fi
        ;;
    "js")
        echo "🔧 Exécution du script JavaScript..."
        
        # Vérifier que Node.js est disponible
        if ! command -v node &> /dev/null; then
            echo "❌ Node.js non trouvé"
            echo "💡 Installez Node.js pour utiliser cette option"
            exit 1
        fi
        
        # Vérifier que les dépendances sont installées
        if [ ! -d "node_modules" ]; then
            echo "⚠️ Dépendances manquantes, installation..."
            npm install
        fi
        
        # Exécuter le script de seed JavaScript
        node scripts/seed-users.js
        
        if [ $? -eq 0 ]; then
            echo "✅ Script JavaScript exécuté avec succès"
        else
            echo "❌ Erreur lors de l'exécution du script JavaScript"
            exit 1
        fi
        ;;
    *)
        echo "❌ Option inconnue: $1"
        show_help
        exit 1
        ;;
esac

echo ""
echo "🚀 Vous pouvez maintenant :"
echo "1. Démarrer l'application : npm run dev"
echo "2. Aller sur http://localhost:3000"
echo "3. Se connecter avec elie.gouzou@gmail.com / admin123"
echo "4. Ou tester avec les comptes temporaires"