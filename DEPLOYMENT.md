# 🚀 Guide de Déploiement Ges-Cab en Production

## Prérequis

### Sur votre machine locale :
- Node.js 18+ installé
- Git configuré
- Accès SSH à votre serveur

### Sur votre serveur VPS :
- Ubuntu 20.04+ ou Debian 11+
- Nginx installé
- Nom de domaine configuré

## 📋 Étapes de Déploiement

### 1. Préparation du projet

```bash
# Cloner le projet (si pas déjà fait)
git clone https://github.com/votre-username/ges-cab.git
cd ges-cab

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.production.example .env.local
# Éditez .env.local avec vos vraies variables Supabase
```

### 2. Configuration Supabase

1. **Créer un projet Supabase** sur https://supabase.com
2. **Configurer l'authentification** :
   - Aller dans Authentication > Settings
   - Configurer l'URL du site : `https://votre-domaine.com`
   - Activer les providers souhaités

3. **Créer les tables** :
   ```sql
   -- Exécuter dans l'éditeur SQL de Supabase
   
   -- Table profiles
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     name TEXT,
     role TEXT DEFAULT 'user',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Table cases
   CREATE TABLE cases (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     status TEXT DEFAULT 'ouvert',
     type TEXT,
     client_id TEXT,
     created_by UUID REFERENCES profiles(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Table tasks
   CREATE TABLE tasks (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     priority TEXT DEFAULT 'medium',
     status TEXT DEFAULT 'pending',
     deadline TIMESTAMP WITH TIME ZONE,
     assigned_to_id UUID REFERENCES profiles(id),
     case_id UUID REFERENCES cases(id),
     created_by UUID REFERENCES profiles(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Table events
   CREATE TABLE events (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     start_date TIMESTAMP WITH TIME ZONE NOT NULL,
     end_date TIMESTAMP WITH TIME ZONE,
     created_by UUID REFERENCES profiles(id),
     attendees UUID[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Policies RLS
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
   ALTER TABLE events ENABLE ROW LEVEL SECURITY;

   -- Policies pour profiles
   CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

   -- Policies pour cases
   CREATE POLICY "Users can view all cases" ON cases FOR SELECT USING (true);
   CREATE POLICY "Users can create cases" ON cases FOR INSERT WITH CHECK (auth.uid() = created_by);
   CREATE POLICY "Users can update cases" ON cases FOR UPDATE USING (true);

   -- Policies pour tasks
   CREATE POLICY "Users can view all tasks" ON tasks FOR SELECT USING (true);
   CREATE POLICY "Users can create tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = created_by);
   CREATE POLICY "Users can update tasks" ON tasks FOR UPDATE USING (true);

   -- Policies pour events
   CREATE POLICY "Users can view relevant events" ON events FOR SELECT USING (
     auth.uid() = created_by OR auth.uid() = ANY(attendees)
   );
   CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
   CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = created_by);
   ```

### 3. Préparation du serveur

```bash
# Se connecter au serveur
ssh votre_utilisateur@votre_serveur.com

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Nginx
sudo apt install -y nginx

# Installer Node.js (si besoin pour des scripts serveur)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Créer le répertoire de l'application
sudo mkdir -p /var/www/ges-cab
sudo chown $USER:$USER /var/www/ges-cab
```

### 4. Configuration DNS

Chez votre registraire de domaine, créez ces enregistrements :

```
Type: A
Nom: @
Valeur: [IP de votre serveur]

Type: A  
Nom: www
Valeur: [IP de votre serveur]
```

### 5. Préparation et Build

```bash
# Sur votre machine locale
./scripts/prepare-production.sh

# Si tout est OK, le build sera créé dans dist/
```

### 6. Déploiement

```bash
# Éditer le script de déploiement avec vos informations
nano scripts/deploy.sh

# Modifier ces variables :
REMOTE_USER="votre_utilisateur"
REMOTE_HOST="votre-domaine.com"

# Déployer
./scripts/deploy.sh production
```

### 7. Configuration HTTPS

```bash
# Sur le serveur, télécharger et exécuter le script HTTPS
wget https://raw.githubusercontent.com/votre-repo/ges-cab/main/scripts/setup-https.sh
chmod +x setup-https.sh

# Éditer avec votre domaine et email
nano setup-https.sh

# Exécuter
./setup-https.sh
```

### 8. Tests et Vérifications

1. **Test de fonctionnement** :
   ```bash
   curl -I https://votre-domaine.com
   ```

2. **Vérifier les logs** :
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Test complet** :
   - Ouvrir https://votre-domaine.com
   - Tester l'inscription/connexion
   - Vérifier toutes les fonctionnalités

## 🔄 Maintenance

### Mise à jour de l'application

```bash
# Sur votre machine locale
git pull origin main
npm run build
./scripts/deploy.sh production
```

### Surveillance

```bash
# Installer htop pour surveiller les ressources
sudo apt install htop

# Surveiller l'utilisation
htop

# Vérifier l'espace disque
df -h

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log
```

### Sauvegardes

```bash
# Script de sauvegarde automatique (à ajouter au cron)
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
tar -czf /var/backups/ges-cab-$DATE.tar.gz /var/www/ges-cab
find /var/backups -name "ges-cab-*.tar.gz" -mtime +30 -delete
```

## 🛡️ Sécurité

### Firewall

```bash
# Configurer UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### Mises à jour automatiques

```bash
# Installer unattended-upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 Monitoring (Optionnel)

### Google Analytics

1. Créer un compte Google Analytics
2. Ajouter `VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX` dans .env.production
3. Rebuild et redéployer

### Monitoring serveur avec Netdata

```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

## 🆘 Dépannage

### L'application ne se charge pas
1. Vérifier les logs Nginx : `sudo tail -f /var/log/nginx/error.log`
2. Vérifier que les fichiers sont présents : `ls -la /var/www/ges-cab`
3. Tester la configuration Nginx : `sudo nginx -t`

### Erreurs Supabase
1. Vérifier les variables d'environnement dans .env.production
2. Vérifier les politiques RLS dans Supabase
3. Vérifier l'URL du site dans les paramètres Supabase Auth

### Certificat SSL expiré
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs détaillés
2. Consultez la documentation Supabase
3. Vérifiez la configuration Nginx

---

**🎉 Félicitations ! Votre application Ges-Cab est maintenant en production !**