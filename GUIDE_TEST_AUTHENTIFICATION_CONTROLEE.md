# 🧪 Guide de Test - Authentification Contrôlée

## 🎯 Objectifs de Test

Vérifier que le nouveau système d'authentification contrôlée fonctionne selon les spécifications exactes.

## 📋 Scénarios de Test

### Test 1 : Email Non Enregistré (Accès Refusé)
**Étapes :**
1. Ouvrir http://localhost:3000
2. Saisir un email qui n'existe PAS dans la table `profiles`
   - Exemple : `test-non-existant@exemple.com`
3. Cliquer sur "Continuer"

**Résultat Attendu :**
- ❌ Message d'erreur : "Vous devez être enregistré par l'administrateur."
- ❌ Pas de redirection vers création de mot de passe
- ❌ L'utilisateur reste sur l'écran email

### Test 2 : Email Enregistré Sans Mot de Passe (Première Connexion)
**Pré-requis :** Avoir un utilisateur dans `profiles` sans `password_hash`

**Étapes :**
1. Saisir l'email d'un utilisateur enregistré sans mot de passe
2. Cliquer sur "Continuer"
3. Créer un mot de passe (minimum 6 caractères)
4. Confirmer le mot de passe
5. Cliquer sur "Créer le compte"

**Résultat Attendu :**
- ✅ Redirection vers écran de création de mot de passe
- ✅ Hash du mot de passe stocké dans `password_hash`
- ✅ Connexion automatique après création
- ✅ Redirection vers dashboard principal

### Test 3 : Email Enregistré Avec Mot de Passe (Connexion Standard)
**Pré-requis :** Avoir un utilisateur avec `password_hash` défini

**Étapes :**
1. Saisir l'email d'un utilisateur avec mot de passe
2. Cliquer sur "Continuer"
3. Saisir le mot de passe correct
4. Cliquer sur "Se connecter"

**Résultat Attendu :**
- ✅ Redirection vers écran de saisie mot de passe
- ✅ Vérification du hash avec bcrypt
- ✅ Connexion réussie
- ✅ Message "👋 Bienvenue !"

### Test 4 : Mot de Passe Incorrect
**Étapes :**
1. Saisir email d'un utilisateur existant
2. Saisir un mot de passe INCORRECT
3. Cliquer sur "Se connecter"

**Résultat Attendu :**
- ❌ Message : "Email ou mot de passe incorrect."
- ❌ Pas de connexion
- ❌ Reste sur l'écran de connexion

## 🛠️ Préparation des Données de Test

### Créer un Utilisateur Test dans la Base

```sql
-- Exemple d'utilisateur sans mot de passe (première connexion)
INSERT INTO profiles (id, email, full_name, function, role)
VALUES (
    uuid_generate_v4(),
    'test-nouveau@exemple.com',
    'Utilisateur Test',
    'Avocat',
    'user'
);

-- Exemple d'utilisateur avec mot de passe (créé via l'interface)
-- Le password_hash sera généré automatiquement lors de la première connexion
```

### Vérifier les Données

```sql
-- Vérifier qu'un utilisateur existe
SELECT id, email, full_name, password_hash IS NOT NULL as has_password 
FROM profiles 
WHERE email = 'test-nouveau@exemple.com';

-- Vérifier le hash après création mot de passe
SELECT password_hash 
FROM profiles 
WHERE email = 'test-nouveau@exemple.com';
```

## 🔍 Points de Vérification

### Interface Utilisateur
- [ ] Message d'erreur pour email non enregistré
- [ ] Redirection correcte selon l'état du compte
- [ ] Formulaires de mot de passe fonctionnels
- [ ] Messages de succès/erreur appropriés

### Base de Données
- [ ] `password_hash` mis à jour lors de la création
- [ ] Hash bcrypt valide (commence par `$2b$`)
- [ ] Pas de mot de passe en clair stocké

### Sécurité
- [ ] Impossibilité de créer un compte sans pré-enregistrement
- [ ] Vérification hash côté serveur
- [ ] Messages d'erreur génériques (pas d'énumération)

### Session
- [ ] Connexion automatique après création mot de passe
- [ ] Session Supabase Auth créée correctement
- [ ] Redirection vers dashboard

## 🐛 Dépannage

### Problème : "bcryptjs not found"
**Solution :** `npm install bcryptjs`

### Problème : Colonne password_hash n'existe pas
**Solution :** Exécuter la migration `database/add_password_hash_column.sql`

### Problème : Utilisateur créé mais pas de connexion
**Vérification :** Vérifier que l'utilisateur existe dans Supabase Auth ET dans profiles

### Problème : Hash invalide
**Vérification :** S'assurer que bcrypt.hash() est utilisé avec salt >= 10

## 📊 Console de Développement

En mode développement, vérifier dans la console :
- Pas d'erreurs JavaScript
- Requêtes Supabase correctes
- Hash bcrypt généré (commence par `$2b$`)

## ✅ Checklist de Validation

- [ ] Email non enregistré → Refus d'accès
- [ ] Email enregistré sans mot de passe → Création
- [ ] Email enregistré avec mot de passe → Connexion
- [ ] Mot de passe incorrect → Erreur générique
- [ ] Auto-connexion après création → Dashboard
- [ ] Hash bcrypt stocké correctement
- [ ] Aucun envoi d'email de confirmation
- [ ] Messages d'erreur appropriés

---

## 🎉 Test Réussi Si...

1. **Contrôle d'accès** : Seuls les emails pré-enregistrés peuvent continuer
2. **Sécurité** : Mots de passe hachés avec bcrypt
3. **UX fluide** : Connexion automatique après création
4. **Pas de création sauvage** : Impossible de s'inscrire sans pré-enregistrement

Le système est opérationnel quand tous ces points sont validés ! 🚀