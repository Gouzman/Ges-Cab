# 🧪 Guide de Test - Corrections Système d'Authentification

## Tests à Effectuer

### ✅ **Test 1: Email Existant (Connexion Directe)**

**Objectif :** Vérifier qu'un email existant va directement à la connexion sans réinitialisation

**Étapes :**
1. Aller sur la page de connexion
2. Saisir un email d'utilisateur existant (ex: admin@example.com)
3. Cliquer sur "Continuer"

**Résultat attendu :**
- ✅ Redirection directe vers l'écran de saisie du mot de passe
- ✅ Message: "Compte trouvé ! Connecté en tant que : [email]"
- ❌ PAS de processus de réinitialisation automatique
- ❌ PAS d'écran de mot de passe temporaire

---

### ✅ **Test 2: Nouvel Email (Code de Confirmation)**

**Objectif :** Vérifier le nouveau système de code de confirmation

**Étapes :**
1. Aller sur la page de connexion
2. Saisir un nouvel email (ex: test@example.com)
3. Cliquer sur "Continuer"
4. Définir un mot de passe (6+ caractères)
5. Cliquer sur "Créer le compte"

**Résultat attendu :**
- ✅ Écran de création de mot de passe affiché
- ✅ Message: "Compte créé ! Un code de confirmation a été envoyé..."
- ✅ Redirection automatique vers écran de confirmation d'email
- ✅ En mode dev: Code affiché dans la console (ex: `2467e!`)

**Étapes continuation :**
6. Sur l'écran de confirmation, saisir le code affiché en console
7. Cliquer sur "Confirmer"

**Résultat attendu :**
- ✅ Message: "Email confirmé ! Vous pouvez maintenant vous connecter"
- ✅ Redirection vers écran de connexion normal

---

### ✅ **Test 3: Compte Créé par Admin (Mot de Passe Temporaire)**

**Objectif :** Vérifier que les comptes créés par admin gardent l'ancien système

**Prérequis :** Être connecté en tant qu'admin

**Étapes :**
1. Aller dans Gestion d'équipe ou UserManagement
2. Créer un nouvel utilisateur
3. Noter le mot de passe temporaire généré (ex: `AB3C9X2M`)
4. Se déconnecter
5. Essayer de se connecter avec le nouvel email

**Résultat attendu :**
- ✅ Écran de première connexion avec mot de passe temporaire
- ✅ Possibilité de conserver ou changer le mot de passe
- ✅ Format: 8 caractères alphanumériques

---

### ✅ **Test 4: Mode Développement**

**Objectif :** Vérifier les outils de développement

**Prérequis :** Variable `VITE_APP_ENV=development`

**Étapes :**
1. Créer un nouveau compte
2. Sur l'écran de confirmation d'email, chercher le bouton "🧪 Utiliser code de test (dev)"
3. Cliquer dessus

**Résultat attendu :**
- ✅ Code `2467e!` inséré automatiquement
- ✅ Message toast: "Code de test inséré: 2467e!"
- ✅ Validation fonctionne avec ce code

---

### ✅ **Test 5: Validation des Codes**

**Objectif :** Tester la validation des codes de confirmation

**Codes à tester :**
- ✅ `2467e!` (valide)
- ✅ `8a3b9z` (valide)
- ❌ `12345` (invalide - trop court)
- ❌ `ABCDEF` (invalide - majuscules)
- ❌ `123abc` (valide)

**Résultat attendu :**
- ✅ Codes valides acceptés
- ❌ Codes invalides rejetés avec message d'erreur clair

---

## 🔧 Dépannage

### Problème: Code de confirmation ne s'affiche pas en console
**Solution:** Vérifier que `VITE_APP_ENV=development` dans `.env.local`

### Problème: Email existant va vers création de compte
**Solution:** Vérifier que l'utilisateur existe bien dans la base `profiles`

### Problème: Erreur "Service indisponible" en production
**Solution:** Normal - les fonctions RPC ne sont pas encore implémentées

---

## 📊 Checklist de Validation

- [ ] Email existant → Connexion directe
- [ ] Nouvel email → Code de confirmation
- [ ] Compte admin → Mot de passe temporaire
- [ ] Mode dev → Outils de test disponibles
- [ ] Validation codes → Messages d'erreur appropriés
- [ ] Build → Succès sans erreurs
- [ ] Navigation → Retour/annulation fonctionnent

---

## 🚀 Prochaines Étapes

1. **Implémentation RPC Supabase**
   - Fonction `send_confirmation_email`
   - Fonction `verify_confirmation_code`

2. **Service d'Email**
   - Intégration Resend/SendGrid
   - Templates d'email personnalisés

3. **Monitoring**
   - Taux de confirmation d'email
   - Temps de validation des codes