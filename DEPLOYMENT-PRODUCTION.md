# 🚀 Guide de Déploiement Production - Ges-Cab

## Vue d'ensemble

Ce guide vous accompagne dans le déploiement de votre application Ges-Cab en production avec Supabase self-hosted sur votre VPS.

## 📋 Pré-requis

### Sur votre machine locale :
- [x] Node.js 18+ installé
- [x] Git configuré
- [x] Accès SSH à votre VPS (clé SSH configurée)
- [x] Application Ges-Cab développée et testée

### Sur votre VPS :
- [x] Ubuntu 20.04+ ou Debian 11+
- [x] Minimum 4GB RAM, 2 CPU cores
- [x] 50GB d'espace disque libre
- [x] Accès root ou sudo

### Domaine :
- [x] Nom de domaine acheté
- [x] DNS configuré vers votre VPS :
  - `A` record : `votredomaine.com` → `IP_VPS`
  - `A` record : `www.votredomaine.com` → `IP_VPS`
  - `A` record : `api.votredomaine.com` → `IP_VPS`
  - `A` record : `studio.votredomaine.com` → `IP_VPS`

## 🚀 Processus de Déploiement

### Étape 1 : Préparation

```bash
# Rendez le script exécutable
chmod +x scripts/deploy-production.sh

# Vérifiez votre connexion SSH
ssh root@VOTRE_IP_VPS "echo 'Test connexion OK'"
```

### Étape 2 : Lancement du déploiement

```bash
# Remplacez par vos vraies valeurs
./scripts/deploy-production.sh votredomaine.com root@VOTRE_IP_VPS
```

### Étape 3 : Monitoring du déploiement

Le script va automatiquement :

1. ✅ **Préparer l'application** (build, packaging)
2. ✅ **Installer les dépendances** (Docker, Nginx, Certbot)
3. ✅ **Transférer les fichiers** vers le VPS
4. ✅ **Configurer Supabase** self-hosted
5. ✅ **Configurer Nginx** avec SSL
6. ✅ **Obtenir les certificats SSL** Let's Encrypt
7. ✅ **Démarrer les services** Docker
8. ✅ **Initialiser la base de données** avec le schéma complet
9. ✅ **Créer les scripts de maintenance** et backups

## 🔧 Configuration Post-Déploiement

### 1. Première connexion à Supabase Studio

1. Allez sur `https://studio.votredomaine.com`
2. Connectez-vous avec les identifiants affichés à la fin du déploiement
3. Créez votre premier utilisateur admin

### 2. Configuration SMTP (optionnel)

```bash
# Connectez-vous à votre VPS
ssh root@VOTRE_IP_VPS

# Éditez la configuration Supabase
cd /opt/ges-cab/supabase-docker/docker
nano .env

# Modifiez les paramètres SMTP :
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@votredomaine.com
SMTP_PASS=votre_mot_de_passe_app

# Redémarrez les services
docker-compose restart
```

### 3. Configuration de l'application

Mettez à jour les variables d'environnement de votre application :

```javascript
// Dans votre build de production
const supabaseUrl = 'https://api.votredomaine.com'
const supabaseAnonKey = 'votre_anon_key_générée'
```

## 🔍 Vérification du Déploiement

### Tests de fonctionnement

```bash
# Test de l'application principale
curl -I https://votredomaine.com
# Devrait retourner : HTTP/2 200

# Test de l'API Supabase
curl -I https://api.votredomaine.com/health
# Devrait retourner : HTTP/2 200

# Test du Studio
curl -I https://studio.votredomaine.com
# Devrait retourner : HTTP/2 200
```

### Vérification des services Docker

```bash
ssh root@VOTRE_IP_VPS
cd /opt/ges-cab/supabase-docker/docker
docker-compose ps

# Tous les services doivent être "Up"
```

## 🛡️ Sécurité

### Firewall (recommandé)

```bash
# Sur votre VPS
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

### Mise à jour automatique

```bash
# Configuration des mises à jour automatiques de sécurité
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 Monitoring et Maintenance

### Logs de l'application

```bash
# Logs Nginx
tail -f /var/log/nginx/ges-cab.access.log
tail -f /var/log/nginx/ges-cab.error.log

# Logs Docker
docker-compose logs -f

# Logs de backup
tail -f /var/log/ges-cab-backup.log
```

### Backups automatiques

Les backups sont configurés automatiquement :
- **Fréquence** : Quotidienne à 2h du matin
- **Rétention** : 7 jours
- **Localisation** : `/opt/ges-cab/backups/`

### Commandes utiles

```bash
# Redémarrer tous les services
cd /opt/ges-cab/supabase-docker/docker
docker-compose restart

# Voir l'utilisation des ressources
docker stats

# Backup manuel
/opt/ges-cab/backup.sh

# Renouvellement SSL manuel
sudo certbot renew
```

## 🆘 Dépannage

### Problèmes courants

#### 1. Erreur SSL/TLS
```bash
# Vérifier les certificats
sudo certbot certificates

# Renouveler si nécessaire
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

#### 2. Services Docker qui ne démarrent pas
```bash
# Vérifier les logs
docker-compose logs

# Redémarrer proprement
docker-compose down
docker-compose up -d
```

#### 3. Problème de base de données
```bash
# Accéder à la base de données
docker exec -it supabase-docker_db_1 psql -U postgres -d ges_cab_prod

# Vérifier les tables
\dt

# Restaurer depuis un backup
docker exec -i supabase-docker_db_1 psql -U postgres -d ges_cab_prod < /opt/ges-cab/backups/db_backup_YYYYMMDD_HHMMSS.sql
```

#### 4. Problème de permissions
```bash
# Réparer les permissions
sudo chown -R www-data:www-data /opt/ges-cab/dist
sudo chmod -R 755 /opt/ges-cab/dist
```

### Support et logs

```bash
# Diagnostic complet du système
cd /opt/ges-cab
./scripts/diagnostic.sh

# Collecter tous les logs importants
mkdir -p /tmp/ges-cab-support
cp /var/log/nginx/ges-cab.* /tmp/ges-cab-support/
docker-compose logs > /tmp/ges-cab-support/docker.log
tar -czf ges-cab-support-$(date +%Y%m%d).tar.gz /tmp/ges-cab-support/
```

## 📈 Optimisations de Performance

### 1. Configuration Nginx avancée
```bash
# Éditer la configuration
sudo nano /etc/nginx/sites-available/ges-cab

# Ajouter la compression Gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. Monitoring avec Grafana (optionnel)
```bash
# Installation rapide de monitoring
cd /opt/ges-cab
curl -o docker-compose.monitoring.yml https://raw.githubusercontent.com/stefanprodan/dockprom/master/docker-compose.yml
docker-compose -f docker-compose.monitoring.yml up -d
```

## 🎯 Checklist de Validation

- [ ] Application accessible sur `https://votredomaine.com`
- [ ] API Supabase accessible sur `https://api.votredomaine.com`
- [ ] Studio accessible sur `https://studio.votredomaine.com`
- [ ] Certificats SSL valides et automatiquement renouvelés
- [ ] Base de données initialisée avec le bon schéma
- [ ] Premier utilisateur admin créé
- [ ] Backups automatiques configurés
- [ ] Monitoring des logs fonctionnel
- [ ] Tests de toutes les fonctionnalités de l'app

## 🎉 Félicitations !

Votre application Ges-Cab est maintenant en production avec :

- ✅ **Haute disponibilité** avec Nginx + Docker
- ✅ **Sécurité** avec SSL/TLS et firewall
- ✅ **Base de données** Supabase self-hosted
- ✅ **Backups automatiques** quotidiens
- ✅ **Monitoring** et logs centralisés
- ✅ **Maintenance** automatisée

Votre cabinet juridique numérique est prêt à accompagner vos clients ! 🚀