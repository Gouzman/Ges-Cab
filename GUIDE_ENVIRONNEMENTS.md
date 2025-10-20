# 🔧 Guide des Environnements - Ges-Cab

## 🎯 Vue d'ensemble

Ce guide vous permet de basculer facilement entre les différents environnements de développement et de production.

## 🏗️ Architecture des Environnements

```
├── 🧪 Développement Local (.env.local)
│   ├── Supabase CLI (127.0.0.1:54321)
│   ├── Base PostgreSQL locale (54322)
│   ├── Studio UI (54323)
│   └── Mailpit (54324)
│
├── 🚀 Production Cloud (.env.production)
│   ├── 🥇 Supabase Cloud (gesadminsystem.supabase.co)
│   └── 🔄 VPS Fallback (api.ges-cab.com)
│
└── 🛠️ Base PostgreSQL (.env)
    └── Configuration PostgreSQL locale basique
```

## 🚦 Commandes de Basculement Rapide

### 🧪 Développement Local

```bash
# 1. Démarrer l'environnement local
docker start  # Assurer que Docker fonctionne
supabase start  # Démarrer Supabase CLI

# 2. Démarrer l'application
npm run dev  # Utilise automatiquement .env.local

# 3. Accéder aux services
open http://localhost:3001/          # Application
open http://127.0.0.1:54323          # Supabase Studio
open http://127.0.0.1:54324          # Mailpit (emails)
```

### 🚀 Production

```bash
# 1. Build pour la production
npm run build  # Utilise automatiquement .env.production

# 2. Déployer
npm run deploy  # Ou votre script de déploiement
```

## 🔄 Basculement Manuel Entre Environnements

### Option 1: Modification de .env.local (Recommandé)

**Pour tester avec Supabase Cloud en développement:**
```bash
# Dans .env.local, décommentez les lignes:
VITE_SUPABASE_URL=https://gesadminsystem.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Et commentez les lignes locales:
# VITE_SUPABASE_URL=http://127.0.0.1:54321
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Pour tester avec VPS auto-hébergé:**
```bash
# Dans .env.local, décommentez les lignes:
VITE_SUPABASE_URL=https://api.ges-cab.com
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Option 2: Scripts de Basculement Automatique

```bash
# Scripts à créer (optionnels)
npm run env:local      # Basculer vers local
npm run env:cloud      # Basculer vers Supabase Cloud
npm run env:vps        # Basculer vers VPS auto-hébergé
npm run env:production # Basculer vers production complète
```

## 🔍 Diagnostic des Environnements

### Vérifier l'environnement actuel
```bash
# Dans la console de votre navigateur:
console.log('Environment:', import.meta.env.VITE_ENVIRONMENT)
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('App URL:', import.meta.env.VITE_APP_URL)
```

### Tests de connectivité
```bash
# Test Supabase local
curl http://127.0.0.1:54321/health

# Test Supabase Cloud  
curl https://gesadminsystem.supabase.co/rest/v1/

# Test VPS auto-hébergé
curl https://api.ges-cab.com/health
```

## 🛡️ Sécurité et Bonnes Pratiques

### ✅ À faire
- Toujours utiliser `.env.local` pour le développement
- Ne jamais committer les vraies clés de production
- Utiliser des clés distinctes pour chaque environnement
- Tester en local avant de déployer

### ❌ À éviter
- Utiliser les clés de production en développement
- Partager les fichiers `.env.*` dans Git
- Mélanger les configurations d'environnement

## 🔧 Dépannage Courant

### Problème: Application ne démarre pas
```bash
# Vérifier les variables d'environnement
cat .env.local | grep VITE_

# Redémarrer Supabase local
supabase stop && supabase start

# Nettoyer le cache
rm -rf node_modules/.cache
npm run dev
```

### Problème: Erreur 401 Unauthorized
```bash
# Vérifier la configuration Supabase
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Vérifier la connectivité
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" $VITE_SUPABASE_URL/rest/v1/
```

### Problème: Base de données inaccessible
```bash
# Vérifier Supabase local
supabase status

# Redémarrer Docker
docker restart $(docker ps -q)

# Vérifier les ports
lsof -i :54321,54322,54323,54324
```

## 📚 Ressources

- **Supabase CLI**: https://supabase.com/docs/guides/cli
- **Vite Environment**: https://vitejs.dev/guide/env-and-mode.html
- **Docker**: https://docs.docker.com/get-started/

## 📞 Support

En cas de problème, vérifiez:
1. Les logs de l'application (console du navigateur)
2. Les logs de Supabase (`supabase logs`)
3. Les logs de Docker (`docker logs <container>`)
4. Ce guide pour les solutions communes