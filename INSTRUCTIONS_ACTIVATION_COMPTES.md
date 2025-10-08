# Instructions pour ajouter la fonctionnalité d'activation/désactivation des comptes

## 🔧 Étapes à suivre dans Supabase Dashboard

### 1. Se connecter au Dashboard Supabase
1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous à votre projet Ges-Cab

### 2. Accéder à l'éditeur SQL
1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New query"**

### 3. Exécuter les requêtes SQL
Copiez et collez ces requêtes dans l'éditeur SQL, puis cliquez sur **"Run"** :

```sql
-- Ajouter la colonne is_active à la table profiles
ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Mettre tous les utilisateurs existants comme actifs par défaut
UPDATE profiles SET is_active = true WHERE is_active IS NULL;

-- Vérifier que la colonne a été ajoutée correctement
SELECT id, name, email, is_active FROM profiles LIMIT 5;
```

### 4. Vérification
Après avoir exécuté les requêtes, vous devriez voir :
- ✅ La colonne `is_active` ajoutée à la table `profiles`
- ✅ Tous les utilisateurs existants ont `is_active = true`
- ✅ La dernière requête affiche les utilisateurs avec leur statut

## 🎯 Une fois la colonne créée

### Test de la fonctionnalité
Exécutez ce script pour tester :
```bash
node tools/test-user-activation.mjs
```

### Fonctionnalités disponibles
- 🟢 **Badge de statut** : Vert pour "Actif", Rouge pour "Inactif" 
- ⚡ **Bouton Power** : Clic pour activer/désactiver un compte
- 🔔 **Notifications** : Confirmation des changements de statut
- 🛡️ **Sécurité** : Impossible de se désactiver soi-même

## 🚨 Sécurité importante

### Row Level Security (RLS)
Si vous avez des politiques RLS sur la table `profiles`, vous devrez peut-être les mettre à jour pour permettre la modification de la colonne `is_active`.

Exemple de politique RLS pour permettre aux admins de modifier le statut :
```sql
-- Permettre aux admins de modifier le statut des utilisateurs
CREATE POLICY "Admins can update user status" ON profiles
FOR UPDATE USING (
  auth.jwt() ->> 'role' = 'authenticated' AND 
  (
    auth.jwt() ->> 'user_metadata' ->> 'function' = 'Gerant' OR
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'Admin'
  )
);
```

## 📱 Interface utilisateur

Une fois la colonne créée, l'interface affichera :
- **Statut visible** : Badge coloré à côté du rôle
- **Action rapide** : Bouton power pour basculer le statut
- **Feedback immédiat** : Toast de confirmation
- **Protection** : Impossible de se désactiver soi-même

---

💡 **Note** : Cette approche est plus sûre que la suppression car elle :
- Préserve toutes les données utilisateur
- Permet une réactivation rapide
- Évite les suppressions accidentelles
- Maintient l'historique des actions