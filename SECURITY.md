# 🔐 Guide de Sécurité - Ges-Cab

## Configuration des Variables d'Environnement

### 1. Fichier .env.local (requis)
Créez un fichier `.env.local` à la racine du projet avec vos vraies clés Supabase :

```bash
# Configuration Supabase - NE PAS COMMITTER CE FICHIER
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_vraie_cle_anonyme

# Configuration Rate Limiting (optionnel)
VITE_API_RATE_LIMIT=50
VITE_RATE_LIMIT_WINDOW_MS=60000

# Configuration environnement
VITE_APP_ENV=development
```

### 2. Sécurité des Clés
- ✅ Les clés Supabase sont maintenant chargées depuis `.env.local`
- ✅ Le fichier `.env.local` est dans `.gitignore`
- ✅ Aucune clé n'est codée en dur dans le code source
- ✅ Validation des variables d'environnement au démarrage

## Rate Limiting

### Fonctionnalités
- **Token Bucket** : 50 requêtes par minute par défaut
- **Monitoring en temps réel** : Panel de debug en développement
- **Protection automatique** : Appliqué sur toutes les opérations Supabase
- **Gestion des erreurs** : Messages d'erreur explicites

### Configuration
```javascript
// Dans .env.local
VITE_API_RATE_LIMIT=50          // Nombre max de requêtes
VITE_RATE_LIMIT_WINDOW_MS=60000 // Fenêtre de temps (1 minute)
```

### Utilisation
```javascript
import { supabase } from '@/lib/customSupabaseClient';

// Rate limiting automatique
const { data, error } = await supabase
  .from('tasks')
  .select('*');

// Client sans rate limiting (cas spéciaux)
import { supabaseRaw } from '@/lib/customSupabaseClient';
```

## Monitoring et Debug

### Panel de Debug (développement uniquement)
- Affiché en bas à droite de l'écran
- Montre l'état des buckets de rate limiting
- Indicateur visuel des blocages
- Statistiques en temps réel

### Hook de Monitoring
```javascript
import { useRateLimitMonitor } from '@/hooks/useRateLimitMonitor';

const { stats, isBlocked, checkRateLimit } = useRateLimitMonitor();
```

## Vérifications de Sécurité

### Tests Automatisés
```bash
# Scan des secrets exposés
npm run secretlint

# Vérification de la configuration
npm run build
```

### Checklist Sécurité
- [ ] `.env.local` créé avec vraies clés
- [ ] `.env.local` dans `.gitignore`
- [ ] Build successful sans erreur de configuration
- [ ] Secretlint passe sans détection
- [ ] Rate limiting fonctionnel en développement

## Configuration Supabase

### Recommandations
1. **Utilisez la clé anon** pour le frontend (jamais la clé service)
2. **Configurez les RLS** (Row Level Security) sur toutes les tables
3. **Limitez les permissions** de la clé anon aux opérations nécessaires
4. **Activez l'authentification** requise pour les opérations sensibles

### Exemple de RLS
```sql
-- Exemple de politique pour la table tasks
CREATE POLICY "Users can only see their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);
```

## Déploiement

### Variables d'environnement de production
```bash
# Variables Netlify/Vercel
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod_anon_key
VITE_API_RATE_LIMIT=100
VITE_APP_ENV=production
```

### Sécurisation supplémentaire
- Utilisez des domaines autorisés dans Supabase
- Configurez CORS appropriément
- Activez HTTPS strict
- Surveillez les logs d'accès

---

🚨 **Important** : Ne committez jamais le fichier `.env.local` ou les vraies clés API !