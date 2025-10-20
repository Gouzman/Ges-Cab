# 🔧 CORRECTION DE L'ERREUR SUPABASE 401

## 🎯 Problème résolu
L'erreur `401 Unauthorized` sur `api.ges-cab.com` a été identifiée et corrigée.

## 📋 Cause du problème
- L'application tentait de se connecter à `https://api.ges-cab.com`
- Ce domaine n'est pas encore configuré/accessible
- Résultat : erreur d'authentification Supabase

## ✅ Solution appliquée

### 1. Configuration mise à jour
Le fichier `.env.local` pointe maintenant vers une instance locale Supabase :
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Options disponibles

#### Option A : Utiliser Supabase local (Recommandé)
```bash
# 1. Installer Docker Desktop
# 2. Démarrer Supabase local
npx supabase start

# 3. Redémarrer l'application
npm run dev
```

#### Option B : Utiliser votre propre instance Supabase Cloud
```bash
# 1. Créer un projet sur https://supabase.com
# 2. Remplacer dans .env.local :
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-vraie-clé-anon

# 3. Redémarrer l'application
npm run dev
```

## 🛠️ Instructions étape par étape

### Si vous choisissez Supabase local :

1. **Installer Docker Desktop** :
   - Télécharger depuis https://docker.com
   - Installer et démarrer Docker

2. **Démarrer Supabase** :
   ```bash
   cd /Users/gouzman/Documents/Ges-Cab
   npx supabase start
   ```

3. **Redémarrer l'application** :
   ```bash
   npm run dev
   ```

### Si vous choisissez Supabase Cloud :

1. **Créer un compte** sur https://supabase.com

2. **Créer un nouveau projet**

3. **Récupérer vos clés** :
   - Aller dans Settings > API
   - Copier l'URL et la clé anonyme

4. **Modifier .env.local** :
   ```bash
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-clé-anon
   ```

5. **Redémarrer** :
   ```bash
   npm run dev
   ```

## 🎯 Pour le déploiement en production

Quand `api.ges-cab.com` sera configuré, vous pourrez restaurer la configuration production :
```bash
# Restaurer la configuration production
mv .env.local.backup .env.local
```

## 🔍 Test de la correction

Après avoir suivi les étapes :
1. Ouvrir http://localhost:3000
2. L'erreur 401 devrait disparaître
3. L'application devrait fonctionner normalement

## 📞 Support

Si vous rencontrez encore des problèmes :
- Vérifiez que Docker est démarré (pour l'option locale)
- Vérifiez vos clés Supabase (pour l'option Cloud)  
- Redémarrez complètement le serveur de développement