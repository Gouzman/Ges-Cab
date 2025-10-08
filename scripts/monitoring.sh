#!/bin/bash

# Script de monitoring et maintenance - Ges-Cab
# À exécuter régulièrement via cron

LOG_FILE="/var/log/ges-cab-monitoring.log"
SITE_URL="https://votre-domaine.com"
ALERT_EMAIL="admin@votre-domaine.com"

# Fonction de logging
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Fonction d'alerte
send_alert() {
    echo "$1" | mail -s "Ges-Cab Alert" $ALERT_EMAIL
    log_message "ALERT: $1"
}

# Vérification de l'accessibilité du site
check_site_accessibility() {
    log_message "Vérification de l'accessibilité du site..."
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $SITE_URL)
    
    if [ "$HTTP_CODE" != "200" ]; then
        send_alert "Site inaccessible - Code HTTP: $HTTP_CODE"
        return 1
    fi
    
    log_message "Site accessible - Code HTTP: $HTTP_CODE"
    return 0
}

# Vérification de l'espace disque
check_disk_space() {
    log_message "Vérification de l'espace disque..."
    
    DISK_USAGE=$(df /var/www/ges-cab | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$DISK_USAGE" -gt 85 ]; then
        send_alert "Espace disque critique: ${DISK_USAGE}% utilisé"
        return 1
    elif [ "$DISK_USAGE" -gt 75 ]; then
        log_message "WARN: Espace disque élevé: ${DISK_USAGE}% utilisé"
    fi
    
    log_message "Espace disque OK: ${DISK_USAGE}% utilisé"
    return 0
}

# Vérification de la mémoire
check_memory() {
    log_message "Vérification de la mémoire..."
    
    MEMORY_USAGE=$(free | awk '/Mem:/ {printf "%.0f", $3/$2 * 100}')
    
    if [ "$MEMORY_USAGE" -gt 90 ]; then
        send_alert "Utilisation mémoire critique: ${MEMORY_USAGE}%"
        return 1
    elif [ "$MEMORY_USAGE" -gt 80 ]; then
        log_message "WARN: Utilisation mémoire élevée: ${MEMORY_USAGE}%"
    fi
    
    log_message "Utilisation mémoire OK: ${MEMORY_USAGE}%"
    return 0
}

# Vérification des certificats SSL
check_ssl_certificate() {
    log_message "Vérification du certificat SSL..."
    
    CERT_EXPIRY=$(openssl s_client -servername $SITE_URL -connect $SITE_URL:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    CERT_EXPIRY_EPOCH=$(date -d "$CERT_EXPIRY" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( ($CERT_EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    if [ "$DAYS_UNTIL_EXPIRY" -lt 7 ]; then
        send_alert "Certificat SSL expire dans $DAYS_UNTIL_EXPIRY jours"
        return 1
    elif [ "$DAYS_UNTIL_EXPIRY" -lt 30 ]; then
        log_message "WARN: Certificat SSL expire dans $DAYS_UNTIL_EXPIRY jours"
    fi
    
    log_message "Certificat SSL OK - expire dans $DAYS_UNTIL_EXPIRY jours"
    return 0
}

# Nettoyage des logs anciens
cleanup_logs() {
    log_message "Nettoyage des logs anciens..."
    
    # Supprimer les logs Nginx de plus de 30 jours
    find /var/log/nginx/ -name "*.log" -type f -mtime +30 -delete
    
    # Compresser les logs de plus de 7 jours
    find /var/log/nginx/ -name "*.log" -type f -mtime +7 -exec gzip {} \;
    
    # Limiter la taille du log de monitoring
    if [ -f "$LOG_FILE" ]; then
        tail -n 1000 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
    fi
    
    log_message "Nettoyage terminé"
}

# Sauvegarde des fichiers importants
backup_files() {
    log_message "Sauvegarde des fichiers..."
    
    BACKUP_DIR="/var/backups/ges-cab"
    DATE=$(date +%Y%m%d-%H%M%S)
    
    mkdir -p $BACKUP_DIR
    
    # Sauvegarde du site
    tar -czf "$BACKUP_DIR/site-$DATE.tar.gz" /var/www/ges-cab/
    
    # Sauvegarde de la configuration Nginx
    tar -czf "$BACKUP_DIR/nginx-config-$DATE.tar.gz" /etc/nginx/sites-available/ges-cab
    
    # Supprimer les sauvegardes de plus de 30 jours
    find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +30 -delete
    
    log_message "Sauvegarde terminée"
}

# Tests de performance basiques
performance_test() {
    log_message "Test de performance..."
    
    LOAD_TIME=$(curl -o /dev/null -s -w "%{time_total}" $SITE_URL)
    LOAD_TIME_MS=$(echo "$LOAD_TIME * 1000" | bc | cut -d. -f1)
    
    if [ "$LOAD_TIME_MS" -gt 3000 ]; then
        send_alert "Site lent - Temps de chargement: ${LOAD_TIME_MS}ms"
    elif [ "$LOAD_TIME_MS" -gt 2000 ]; then
        log_message "WARN: Site relativement lent - Temps de chargement: ${LOAD_TIME_MS}ms"
    else
        log_message "Performance OK - Temps de chargement: ${LOAD_TIME_MS}ms"
    fi
}

# Fonction principale
main() {
    log_message "=== Début du monitoring ==="
    
    check_site_accessibility
    check_disk_space
    check_memory
    check_ssl_certificate
    performance_test
    cleanup_logs
    
    # Sauvegarde quotidienne (si c'est 2h du matin)
    if [ "$(date +%H)" = "02" ]; then
        backup_files
    fi
    
    log_message "=== Fin du monitoring ==="
}

# Créer le fichier de log s'il n'existe pas
touch $LOG_FILE

# Exécution
main

echo "Monitoring terminé. Voir $LOG_FILE pour les détails."