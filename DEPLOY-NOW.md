# 🚀 DÉPLOIEMENT IMMÉDIAT - Ges-Cab

## 📍 VOS INFORMATIONS

- **Serveur VPS** : `82.25.116.122`
- **Domaine principal** : `ges-cab.com`
- **API Supabase** : `api.ges-cab.com`
- **Studio Admin** : `studio.ges-cab.com`
- **Connexion SSH** : `ssh root@82.25.116.122`

## ⚡ DÉPLOIEMENT EN 3 ÉTAPES

### 1️⃣ Vérification Pré-requis (2 minutes)

```bash
# Test de connexion SSH
ssh root@82.25.116.122 "echo 'Connexion OK'"

# Vérification DNS (doit retourner 82.25.116.122)
nslookup ges-cab.com
nslookup api.ges-cab.com
nslookup studio.ges-cab.com
```

### 2️⃣ Lancement du Déploiement (1 commande)

```bash
# Depuis le répertoire de votre projet Ges-Cab
./deploy-now.sh
```

**OU** si vous préférez la commande complète :

```bash
./scripts/deploy-production.sh ges-cab.com root@82.25.116.122
```

### 3️⃣ Vérification (5 minutes après)

Testez ces URLs dans votre navigateur :
- ✅ https://ges-cab.com (votre application)
- ✅ https://api.ges-cab.com/health (API Supabase)
- ✅ https://studio.ges-cab.com (interface admin)

## 🎯 OÙ EXÉCUTER LES COMMANDES

### **SUR VOTRE MACHINE LOCALE :**

```bash
# 1. Ouvrez un terminal
# 2. Naviguez vers votre projet
cd /Users/gouzman/Documents/Ges-Cab

# 3. Lancez le déploiement
./deploy-now.sh
```

### **CE QUI VA SE PASSER AUTOMATIQUEMENT :**

1. **Build de l'application** React (npm run build)
2. **Installation sur le serveur** (Docker, Nginx, SSL)
3. **Configuration Supabase** self-hosted
4. **Base de données** créée avec toutes vos tables
5. **SSL/HTTPS** automatique avec Let's Encrypt
6. **Backups** automatiques configurés

## 🔐 ACCÈS APRÈS DÉPLOIEMENT

### Studio Supabase (Admin)
- URL : `https://studio.ges-cab.com`
- Identifiants : *(affichés à la fin du déploiement)*

### Première Connexion App
1. Allez sur `https://ges-cab.com`
2. Créez votre premier compte admin
3. Configurez vos paramètres

## 🆘 EN CAS DE PROBLÈME

### Test de diagnostic
```bash
# Connexion au serveur
ssh root@82.25.116.122

# Diagnostic automatique
cd /opt/ges-cab
./scripts/diagnostic.sh
```

### Logs utiles
```bash
# Sur le serveur
tail -f /var/log/nginx/ges-cab.error.log
docker-compose logs -f
```

## ⏱️ TEMPS ESTIMÉ

- **Déploiement complet** : 30-45 minutes
- **Première configuration** : 10 minutes
- **Tests et validation** : 10 minutes

**TOTAL : ~1 heure pour avoir votre cabinet en ligne !**

---

## 🎉 PRÊT À DÉPLOYER ?

**Commande à exécuter MAINTENANT sur votre Mac :**

```bash
cd /Users/gouzman/Documents/Ges-Cab && ./deploy-now.sh
```

Votre application sera en ligne à l'adresse : **https://ges-cab.com** 🚀