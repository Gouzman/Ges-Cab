#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# 🔍 SCRIPT DE DIAGNOSTIC GES-CAB PRODUCTION
# ═══════════════════════════════════════════════════════════════════════════════
# Usage: ./scripts/diagnostic.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() { echo -e "\n${BLUE}═══ $1 ═══${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                     🔍 DIAGNOSTIC GES-CAB PRODUCTION                         ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ VÉRIFICATION SYSTÈME                                                          │
# └───────────────────────────────────────────────────────────────────────────────┘

print_header "INFORMATIONS SYSTÈME"

# Informations système
print_info "Système d'exploitation :"
cat /etc/os-release | grep PRETTY_NAME

print_info "Utilisation des ressources :"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)% utilisé"
echo "RAM: $(free -h | awk '/^Mem:/ {printf "%.1f%% utilisé (%s/%s)\n", $3/$2*100, $3, $2}')"
echo "Disque: $(df -h / | awk 'NR==2 {printf "%s utilisé (%s/%s)\n", $5, $3, $2}')"

print_info "Uptime du système :"
uptime

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ VÉRIFICATION DOCKER                                                           │
# └───────────────────────────────────────────────────────────────────────────────┘

print_header "SERVICES DOCKER"

if command -v docker &> /dev/null; then
    print_success "Docker installé"
    echo "Version: $(docker --version)"
    
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose installé"
        echo "Version: $(docker-compose --version)"
        
        # Statut des services Supabase
        if [ -d "/opt/ges-cab/supabase-docker/docker" ]; then
            cd /opt/ges-cab/supabase-docker/docker
            print_info "Statut des services Supabase :"
            docker-compose ps
            
            print_info "Utilisation des ressources Docker :"
            docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
        else
            print_warning "Répertoire Supabase non trouvé"
        fi
    else
        print_error "Docker Compose non installé"
    fi
else
    print_error "Docker non installé"
fi

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ VÉRIFICATION NGINX                                                            │
# └───────────────────────────────────────────────────────────────────────────────┘

print_header "NGINX"

if command -v nginx &> /dev/null; then
    print_success "Nginx installé"
    echo "Version: $(nginx -v 2>&1)"
    
    # Test de la configuration
    if nginx -t &> /dev/null; then
        print_success "Configuration Nginx valide"
    else
        print_error "Erreur dans la configuration Nginx"
        nginx -t
    fi
    
    # Statut du service
    if systemctl is-active --quiet nginx; then
        print_success "Service Nginx actif"
    else
        print_error "Service Nginx inactif"
        systemctl status nginx --no-pager -l
    fi
    
    # Sites activés
    print_info "Sites Nginx activés :"
    ls -la /etc/nginx/sites-enabled/
    
else
    print_error "Nginx non installé"
fi

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ VÉRIFICATION SSL                                                              │
# └───────────────────────────────────────────────────────────────────────────────┘

print_header "CERTIFICATS SSL"

if command -v certbot &> /dev/null; then
    print_success "Certbot installé"
    
    print_info "Certificats actifs :"
    certbot certificates
    
    # Test de validité des certificats
    print_info "Vérification des certificats :"
    
    # Extraire le domaine depuis la configuration Nginx
    if [ -f "/etc/nginx/sites-available/ges-cab" ]; then
        DOMAIN=$(grep -E "server_name.*;" /etc/nginx/sites-available/ges-cab | head -1 | awk '{print $2}' | sed 's/;//')
        
        if [ ! -z "$DOMAIN" ] && [ "$DOMAIN" != "www.\$DOMAIN" ]; then
            echo "Test SSL pour $DOMAIN :"
            if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null &> /dev/null; then
                print_success "SSL OK pour $DOMAIN"
                # Afficher la date d'expiration
                EXPIRY=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
                echo "Expire le: $EXPIRY"
            else
                print_error "Problème SSL pour $DOMAIN"
            fi
        fi
    fi
else
    print_error "Certbot non installé"
fi

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ VÉRIFICATION RÉSEAU                                                           │
# └───────────────────────────────────────────────────────────────────────────────┘

print_header "TESTS RÉSEAU"

# Ports ouverts
print_info "Ports en écoute :"
netstat -tulpn | grep LISTEN | grep -E "(80|443|8000|3001|5432)"

# Test de connectivité
print_info "Tests de connectivité :"

# Test local
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health | grep -q "200"; then
    print_success "API Supabase locale accessible (port 8000)"
else
    print_warning "API Supabase locale non accessible"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q -E "(200|30.)"; then
    print_success "Studio Supabase local accessible (port 3001)"
else
    print_warning "Studio Supabase local non accessible"
fi

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ VÉRIFICATION BASE DE DONNÉES                                                  │
# └───────────────────────────────────────────────────────────────────────────────┘

print_header "BASE DE DONNÉES"

if [ -d "/opt/ges-cab/supabase-docker/docker" ]; then
    cd /opt/ges-cab/supabase-docker/docker
    
    # Test de connexion à la base
    if docker exec supabase-docker_db_1 pg_isready -U postgres &> /dev/null; then
        print_success "Base de données PostgreSQL accessible"
        
        # Informations sur la base
        print_info "Informations base de données :"
        DB_VERSION=$(docker exec supabase-docker_db_1 psql -U postgres -t -c "SELECT version();" | head -1 | xargs)
        echo "Version PostgreSQL: $DB_VERSION"
        
        DB_SIZE=$(docker exec supabase-docker_db_1 psql -U postgres -d ges_cab_prod -t -c "SELECT pg_size_pretty(pg_database_size('ges_cab_prod'));" | xargs)
        echo "Taille base ges_cab_prod: $DB_SIZE"
        
        # Vérification des tables principales
        print_info "Tables principales :"
        TABLES=$(docker exec supabase-docker_db_1 psql -U postgres -d ges_cab_prod -t -c "\dt" | grep -E "profiles|clients|cases|tasks|events" | wc -l)
        if [ "$TABLES" -ge 5 ]; then
            print_success "$TABLES tables principales trouvées"
        else
            print_warning "Seulement $TABLES tables trouvées (attendu: au moins 5)"
        fi
        
        # Statistiques des données
        print_info "Statistiques des données :"
        docker exec supabase-docker_db_1 psql -U postgres -d ges_cab_prod -c "
        SELECT 
            'profiles' as table_name, COUNT(*) as count FROM profiles
        UNION ALL
        SELECT 'clients', COUNT(*) FROM clients
        UNION ALL
        SELECT 'cases', COUNT(*) FROM cases
        UNION ALL
        SELECT 'tasks', COUNT(*) FROM tasks
        UNION ALL
        SELECT 'events', COUNT(*) FROM events;
        "
        
    else
        print_error "Base de données PostgreSQL non accessible"
    fi
else
    print_warning "Configuration Supabase non trouvée"
fi

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ VÉRIFICATION APPLICATION                                                      │
# └───────────────────────────────────────────────────────────────────────────────┘

print_header "APPLICATION GES-CAB"

# Vérification des fichiers de l'application
if [ -d "/opt/ges-cab/dist" ]; then
    print_success "Fichiers de l'application trouvés"
    DIST_SIZE=$(du -sh /opt/ges-cab/dist | cut -f1)
    echo "Taille du build: $DIST_SIZE"
    
    # Vérification des fichiers principaux
    if [ -f "/opt/ges-cab/dist/index.html" ]; then
        print_success "Fichier index.html présent"
    else
        print_error "Fichier index.html manquant"
    fi
    
    # Permissions
    PERMISSIONS=$(stat -c "%a" /opt/ges-cab/dist)
    if [ "$PERMISSIONS" = "755" ]; then
        print_success "Permissions correctes (755)"
    else
        print_warning "Permissions: $PERMISSIONS (recommandé: 755)"
    fi
else
    print_error "Répertoire /opt/ges-cab/dist non trouvé"
fi

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ VÉRIFICATION BACKUPS                                                          │
# └───────────────────────────────────────────────────────────────────────────────┘

print_header "BACKUPS"

if [ -f "/opt/ges-cab/backup.sh" ]; then
    print_success "Script de backup présent"
    
    if [ -d "/opt/ges-cab/backups" ]; then
        print_success "Répertoire de backups présent"
        BACKUP_COUNT=$(ls -1 /opt/ges-cab/backups/*.sql 2>/dev/null | wc -l)
        echo "Nombre de backups DB: $BACKUP_COUNT"
        
        if [ "$BACKUP_COUNT" -gt 0 ]; then
            LAST_BACKUP=$(ls -t /opt/ges-cab/backups/*.sql 2>/dev/null | head -1)
            LAST_BACKUP_DATE=$(stat -c %y "$LAST_BACKUP" | cut -d' ' -f1)
            echo "Dernier backup: $LAST_BACKUP_DATE"
        fi
    else
        print_warning "Répertoire de backups non trouvé"
    fi
    
    # Vérification du cron
    if crontab -l 2>/dev/null | grep -q backup.sh; then
        print_success "Tâche cron de backup configurée"
    else
        print_warning "Tâche cron de backup non trouvée"
    fi
else
    print_error "Script de backup non trouvé"
fi

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ VÉRIFICATION LOGS                                                             │
# └───────────────────────────────────────────────────────────────────────────────┘

print_header "LOGS RÉCENTS"

print_info "Dernières erreurs Nginx (si présentes) :"
if [ -f "/var/log/nginx/ges-cab.error.log" ]; then
    tail -5 /var/log/nginx/ges-cab.error.log 2>/dev/null || echo "Aucune erreur récente"
else
    echo "Fichier de log non trouvé"
fi

print_info "Derniers logs Docker Supabase :"
if [ -d "/opt/ges-cab/supabase-docker/docker" ]; then
    cd /opt/ges-cab/supabase-docker/docker
    docker-compose logs --tail=5 2>/dev/null || echo "Impossible de récupérer les logs Docker"
fi

# ┌───────────────────────────────────────────────────────────────────────────────┐
# │ RÉSUMÉ ET RECOMMANDATIONS                                                     │
# └───────────────────────────────────────────────────────────────────────────────┘

print_header "RÉSUMÉ ET RECOMMANDATIONS"

echo -e "${GREEN}✅ Diagnostic terminé${NC}"
echo ""
echo "📊 Pour un monitoring en temps réel :"
echo "   • Logs Nginx: tail -f /var/log/nginx/ges-cab.access.log"
echo "   • Logs Docker: docker-compose logs -f"
echo "   • Ressources: htop ou docker stats"
echo ""
echo "🔧 Commandes utiles :"
echo "   • Redémarrer services: cd /opt/ges-cab/supabase-docker/docker && docker-compose restart"
echo "   • Backup manuel: /opt/ges-cab/backup.sh"
echo "   • Test Nginx: nginx -t && systemctl reload nginx"
echo ""
echo "📞 En cas de problème :"
echo "   • Vérifiez les logs ci-dessus"
echo "   • Consultez la documentation: /opt/ges-cab/DEPLOYMENT-PRODUCTION.md"
echo "   • Créez un support bundle: tar -czf diagnostic-$(date +%Y%m%d).tar.gz /var/log/nginx/ /opt/ges-cab/supabase-docker/docker/"

echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                          🎯 DIAGNOSTIC TERMINÉ                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"