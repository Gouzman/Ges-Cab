# ✅ Checklist de Mise en Production - Ges-Cab

## 📋 Avant le Déploiement

### Développement
- [ ] Code testé et fonctionnel en local
- [ ] Toutes les erreurs ESLint corrigées
- [ ] Variables d'environnement de production configurées
- [ ] Build de production testé localement (`npm run preview`)
- [ ] Audit de sécurité passé (`npm audit`)

### Supabase
- [ ] Projet Supabase créé
- [ ] Tables créées avec les bonnes structures
- [ ] Politiques RLS configurées
- [ ] URL et clés API récupérées
- [ ] Authentification configurée avec votre domaine

### Serveur
- [ ] VPS configuré et accessible via SSH
- [ ] Nom de domaine pointé vers l'IP du serveur
- [ ] Nginx installé
- [ ] Certificats SSL prêts (ou Let's Encrypt)

## 🚀 Déploiement

### Étape 1: Préparation
- [ ] Exécuter `npm run prepare-prod`
- [ ] Vérifier que le build est créé dans `dist/`
- [ ] Configurer les variables dans `scripts/deploy.sh`

### Étape 2: Déploiement Initial
- [ ] Exécuter `npm run deploy`
- [ ] Vérifier que les fichiers sont bien uploadés
- [ ] Tester l'accès HTTP : `http://votre-domaine.com`

### Étape 3: Configuration HTTPS
- [ ] Modifier `scripts/setup-https.sh` avec votre domaine
- [ ] Exécuter le script HTTPS sur le serveur
- [ ] Tester l'accès HTTPS : `https://votre-domaine.com`
- [ ] Vérifier la redirection HTTP → HTTPS

### Étape 4: Tests Post-Déploiement
- [ ] Navigation générale fonctionne
- [ ] Inscription/Connexion fonctionnent
- [ ] Création de dossiers fonctionne
- [ ] Création de tâches fonctionne
- [ ] Calendrier fonctionne
- [ ] Gestion d'équipe fonctionne
- [ ] Facturation fonctionne
- [ ] Rapports fonctionnent

## 🛡️ Sécurité et Performance

### Sécurité
- [ ] HTTPS activé et fonctionnel
- [ ] Headers de sécurité configurés dans Nginx
- [ ] Firewall configuré (`ufw`)
- [ ] Accès SSH sécurisé (clés, port non-standard)
- [ ] Variables sensibles non exposées

### Performance
- [ ] Compression gzip/brotli activée
- [ ] Cache des assets statiques configuré
- [ ] Score Lighthouse > 90 (`npm run lighthouse`)
- [ ] Temps de chargement < 2 secondes

## 📊 Monitoring et Maintenance

### Monitoring
- [ ] Script de monitoring configuré
- [ ] Cron job configuré pour le monitoring
- [ ] Email d'alerte configuré
- [ ] Logs Nginx surveillés

### Sauvegardes
- [ ] Sauvegarde automatique configurée
- [ ] Test de restauration effectué
- [ ] Sauvegarde Supabase programmée

### Maintenance
- [ ] Mises à jour automatiques configurées
- [ ] Documentation de déploiement accessible
- [ ] Procédures de rollback définies

## 🚨 En Cas de Problème

### Site Inaccessible
1. Vérifier les logs : `sudo tail -f /var/log/nginx/error.log`
2. Vérifier la config Nginx : `sudo nginx -t`
3. Redémarrer Nginx : `sudo systemctl restart nginx`

### Erreurs d'Application
1. Vérifier les variables d'environnement
2. Vérifier la console du navigateur
3. Tester les API Supabase

### Certificat SSL Expiré
1. Renouveler : `sudo certbot renew --force-renewal`
2. Redémarrer Nginx : `sudo systemctl reload nginx`

## 📞 Contacts d'Urgence

- **Hébergeur** : [contact hébergeur]
- **Registraire** : [contact registraire]  
- **Développeur** : [votre contact]

---

## 🎉 Félicitations !

Une fois tous ces points cochés, votre application Ges-Cab est officiellement en production et prête à servir vos utilisateurs !

**URL de production** : https://votre-domaine.com
**Panel d'admin Supabase** : https://app.supabase.com
**Monitoring** : Logs accessible via SSH

### Prochaines Étapes Recommandées

1. **Mettre en place un CDN** (Cloudflare)
2. **Configurer un backup automatique de la base de données**
3. **Ajouter un système de monitoring avancé** (Uptime Robot)
4. **Mettre en place des tests automatisés**
5. **Documenter les procédures pour l'équipe**