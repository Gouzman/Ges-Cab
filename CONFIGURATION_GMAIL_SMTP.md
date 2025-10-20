# 📧 Configuration Gmail SMTP - Guide Express

## 🎯 Objectif
Envoyer les emails de réinitialisation directement à l'adresse Gmail de l'utilisateur (ex: elie.gouzou@gmail.com) au lieu de les capturer dans Mailpit.

## ⚡ Configuration Rapide (5 minutes)

### 1️⃣ Générer un Mot de Passe d'Application Gmail

1. **Aller sur** : https://myaccount.google.com/security
2. **Activer** : Authentification à 2 facteurs (si pas déjà fait)
3. **Cliquer** : "Mots de passe des applications"
4. **Sélectionner** : "Autre (nom personnalisé)"
5. **Taper** : "Ges-Cab Local Dev"
6. **Copier** : Le mot de passe généré (16 caractères, ex: `abcd efgh ijkl mnop`)

### 2️⃣ Configurer les Variables d'Environnement

**Ouvrir le fichier `.env.local`** et modifier :

```bash
# 📧 CONFIGURATION SMTP POUR VRAIS EMAILS (Gmail)
SMTP_EMAIL=elie.gouzou@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
ADMIN_EMAIL=elie.gouzou@gmail.com
```

⚠️ **Remplacer** `elie.gouzou@gmail.com` par votre vraie adresse Gmail
⚠️ **Remplacer** `abcd efgh ijkl mnop` par votre vrai mot de passe d'application

### 3️⃣ Redémarrer Supabase

```bash
supabase stop
supabase start
```

## 🚀 Script Automatique (Recommandé)

**Utiliser le script d'aide :**
```bash
./configure-gmail-smtp.sh
```

Ce script vous guidera interactivement pour :
- ✅ Saisir votre email Gmail
- ✅ Saisir votre mot de passe d'application
- ✅ Redémarrer Supabase automatiquement
- ✅ Tester la configuration

## 🧪 Test

1. **Ouvrir** : http://localhost:3000
2. **Cliquer** : "Mot de passe oublié"
3. **Entrer** : votre adresse Gmail (ex: elie.gouzou@gmail.com)
4. **Cliquer** : "Envoyer le lien"
5. **Observer** : Toast "Email envoyé à votre adresse Gmail"
6. **Vérifier** : Votre boîte Gmail (peut prendre 1-2 minutes)

## 📊 États de Configuration

| Configuration | Message Toast | Destination Email |
|---------------|---------------|-------------------|
| **Mailpit (défaut)** | "Email envoyé à Mailpit" | Mailpit local |
| **Gmail SMTP** ✅ | "Email envoyé à votre adresse Gmail" | Vraie boîte Gmail |
| **Production** | "Lien de réinitialisation envoyé" | Email de production |

## 🐛 Dépannage

### Erreur "Invalid credentials"
```bash
# Vérifier les variables
grep SMTP_ .env.local

# Régénérer le mot de passe d'application Gmail
```

### Email non reçu
```bash
# Vérifier les logs Supabase
supabase logs

# Vérifier le dossier Spam de Gmail
```

### Configuration non prise en compte
```bash
# Redémarrer complètement
supabase stop && sleep 5 && supabase start
npm run dev
```

## ✅ Résultat

Après configuration, les emails seront envoyés **directement à votre adresse Gmail** au lieu d'être capturés localement ! 🎉