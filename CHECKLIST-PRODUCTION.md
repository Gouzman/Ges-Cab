# ✅ Checklist de Déploiement Production - Ges-Cab

## 🎯 Avant le Déploiement

### Préparation du domaine
- [ ] Nom de domaine acheté et configuré
- [ ] DNS configuré vers votre VPS :
  - [ ] `A` record : `votredomaine.com` → `IP_VPS`
  - [ ] `A` record : `www.votredomaine.com` → `IP_VPS`
  - [ ] `A` record : `api.votredomaine.com` → `IP_VPS`
  - [ ] `A` record : `studio.votredomaine.com` → `IP_VPS`

### Préparation du VPS
- [ ] VPS avec Ubuntu 20.04+ ou Debian 11+
- [ ] Minimum 4GB RAM, 2 CPU cores, 50GB disque
- [ ] Accès SSH configuré (clé SSH recommandée)
- [ ] Ports 80, 443, 22 ouverts

### Préparation locale
- [ ] Application testée et fonctionnelle
- [ ] Variables d'environnement configurées
- [ ] Build de production testé (`npm run build`)
- [ ] Connexion SSH au VPS testée

## 🚀 Déploiement

### Étape 1 : Lancement
```bash
# Rendre le script exécutable
chmod +x scripts/deploy-production.sh

# Lancer le déploiement (remplacez par vos vraies valeurs)
./scripts/deploy-production.sh votredomaine.com root@VOTRE_IP_VPS
```

### Étape 2 : Monitoring
- [ ] Le script s'execute sans erreur
- [ ] Tous les services Docker démarrent
- [ ] Certificats SSL obtenus avec succès
- [ ] Base de données initialisée

## 🔍 Vérification Post-Déploiement

### Tests d'accès
- [ ] `https://votredomaine.com` → Application accessible
- [ ] `https://api.votredomaine.com/health` → API accessible
- [ ] `https://studio.votredomaine.com` → Studio accessible
- [ ] Certificats SSL valides (cadenas vert)

### Configuration Supabase
- [ ] Connexion à Studio Supabase réussie
- [ ] Premier utilisateur admin créé
- [ ] Tables visibles dans l'interface
- [ ] Configuration SMTP (optionnel)

### Tests fonctionnels
- [ ] Connexion utilisateur fonctionne
- [ ] Création/modification de clients
- [ ] Création/modification de dossiers
- [ ] Création/modification de tâches
- [ ] Upload de documents
- [ ] Calendrier fonctionnel
- [ ] Rapports accessibles

## 🛠️ Configuration Avancée

### Sécurité
- [ ] Firewall configuré (`ufw enable`)
- [ ] Mises à jour automatiques activées
- [ ] Mots de passe forts utilisés
- [ ] Accès SSH sécurisé (clés uniquement)

### Performance
- [ ] Compression Gzip activée
- [ ] Cache navigateur configuré
- [ ] Monitoring des ressources
- [ ] Logs configurés et accessibles

### Maintenance
- [ ] Backups automatiques configurés
- [ ] Script de diagnostic testé
- [ ] Procédures de restauration documentées
- [ ] Monitoring mis en place

## 🆘 En cas de Problème

### Diagnostic rapide
```bash
# Connexion au VPS
ssh root@VOTRE_IP_VPS

# Lancer le diagnostic
cd /opt/ges-cab
./scripts/diagnostic.sh
```

### Commandes utiles
```bash
# Vérifier les services
docker-compose ps

# Voir les logs
docker-compose logs -f

# Redémarrer les services
docker-compose restart

# Test Nginx
nginx -t && systemctl reload nginx

# Backup manuel
/opt/ges-cab/backup.sh
```

### Logs importants
- `/var/log/nginx/ges-cab.access.log`
- `/var/log/nginx/ges-cab.error.log`
- `docker-compose logs`

## 📞 Support

### Documentation
- [ ] `DEPLOYMENT-PRODUCTION.md` lu et compris
- [ ] Scripts de diagnostic disponibles
- [ ] Procédures de backup testées

### Contact
- Créateur : GitHub Copilot
- Documentation : Fichiers MD dans le projet
- Support : Scripts de diagnostic automatique

---

## 🎉 Validation Finale

- [ ] Application en ligne et accessible
- [ ] SSL/TLS configuré et fonctionnel
- [ ] Base de données opérationnelle
- [ ] Utilisateurs peuvent se connecter
- [ ] Toutes les fonctionnalités testées
- [ ] Backups configurés
- [ ] Monitoring en place

**🚀 Votre cabinet juridique numérique Ges-Cab est prêt !**