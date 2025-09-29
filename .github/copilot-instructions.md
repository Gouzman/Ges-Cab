# Instructions pour les Agents IA - Ges-Cab

## Architecture Générale
Ges-Cab est une application de gestion de cabinet professionnel construite avec:
- React + Vite pour le frontend
- Supabase pour l'authentification et le stockage
- Radix UI pour les composants d'interface
- TailwindCSS pour les styles

## Structure Clé
```
src/
  components/     # Composants React principaux
  contexts/       # Contextes React (auth, etc.)
  lib/           # Utilitaires et configurations
```

## Points d'Intégration Critiques

### Authentification et Autorisations
- Authentification via Supabase (`SupabaseAuthContext.jsx`)
- Système de rôles et permissions:
  - Gérant/Associé Émérite: accès total
  - Admin: accès étendu 
  - Utilisateurs: accès restreint selon les permissions dans `Settings.jsx`

### Gestion des Données
- Client Supabase configuré dans `lib/customSupabaseClient.js`
- Tables principales: profiles, tasks, cases, clients, documents
- Requêtes Supabase standardisées avec gestion d'erreurs via toast

## Patterns de Code

### Composants
- Utilisation cohérente de Framer Motion pour les animations
- Structure standard des composants:
  ```jsx
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => { fetchData(); }, []);
  ```

### Gestion des Fichiers
- Upload/download via Supabase Storage
- Vérification systématique des permissions avant manipulation

## Workflow de Développement

### Installation
```bash
npm install
npm run dev # Lance sur localhost:3000
```

### Build et Déploiement
```bash
npm run build  # Génère aussi llms.txt
npm run preview
```

### Points d'Attention
- Toujours vérifier les permissions utilisateur avant les opérations CRUD
- Utiliser le système de toast pour les retours utilisateur
- Suivre les patterns existants pour les formulaires et listes

## Conventions
- Nommage des fichiers: PascalCase pour les composants
- Gestion d'état: useState pour l'état local, contextes pour l'état global
- Style: TailwindCSS avec classes communes pour la cohérence visuelle