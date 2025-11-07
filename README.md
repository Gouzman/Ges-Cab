# Ges-Cab - Gestion de Cabinet

## 📋 Structure du projet

```
Ges-Cab/
├── 🎯 FRONTEND (React + Vite)
│   ├── src/                    # Code source React
│   ├── public/                 # Assets statiques
│   ├── dist/                   # Build de production
│   └── node_modules/           # Dépendances frontend
│
├── 🚀 BACKEND (Node.js + Express)
│   ├── backend/
│   │   ├── server.js          # Serveur principal (port 3003)
│   │   ├── api-server.js      # Serveur API (port 3003)
│   │   └── package.json       # Dépendances backend
│
├── 📊 BASE DE DONNÉES
│   ├── database/              # Scripts SQL et migrations
│   └── supabase/             # Configuration Supabase
│
├── ⚙️ CONFIGURATION
│   ├── .env.local            # Variables d'environnement locales
│   ├── .env.development      # Variables de développement
│   ├── .env.production       # Variables de production
│   └── vite.config.js        # Configuration Vite
│
├── 🛠️ SCRIPTS UTILES
│   ├── start-api.sh          # Démarrer le backend API
│   └── seed-users.sh         # Initialiser les utilisateurs
│
└── 📁 ARCHIVES
    └── archive/               # Anciens scripts et docs archivés
        ├── old-scripts/       # Scripts bash obsolètes
        ├── old-docs/          # Rapports et docs temporaires
        └── old-configs/       # Anciennes configurations
```

## 🚀 Démarrage rapide

### Frontend (React)
```bash
npm run dev                    # Démarre sur http://localhost:3000
```

### Backend (API)
```bash
./start-api.sh                 # Démarre sur http://localhost:3003
# OU
cd backend && npm run dev      # Démarre sur http://localhost:3003
```

### Base de données
```bash
# PostgreSQL local
psql -h localhost -p 5432 -U [votre_user] -d ges_cab
```

## 🏗️ Environnements

- **Développement**: `npm run dev` (ports 3000 + 3003)
- **Production**: `npm run build` puis `npm run preview`

## 📝 Variables importantes

- `VITE_API_URL`: URL de l'API backend (http://localhost:3003)
- `VITE_PG_*`: Configuration PostgreSQL
- Port frontend: 3000 (par défaut)
- Port backend: 3003 (serveurs unifiés)

---
*Projet nettoyé le 6 novembre 2025*