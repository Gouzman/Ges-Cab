# Test de la fonctionnalité "Mot de passe oublié"

## Configuration requise

La fonctionnalité de réinitialisation de mot de passe utilise Supabase Auth et nécessite que les paramètres suivants soient configurés dans votre projet Supabase :

### 1. Configuration Supabase Auth

Dans le dashboard Supabase, onglet "Authentication" > "Settings" :

- **Site URL** : http://localhost:3000 (développement) ou votre domaine de production
- **Redirect URLs** : 
  - http://localhost:3000/#type=recovery&**
  - http://localhost:3000/reset-password
  - Votre domaine de production avec les mêmes patterns

### 2. Template d'email (optionnel)

Vous pouvez personnaliser le template d'email dans "Authentication" > "Email Templates" > "Reset Password".

## Flux de test

### 1. Test du flux "Mot de passe oublié"

1. Aller sur http://localhost:3000
2. Cliquer sur "Mot de passe oublié ?" sur l'écran de connexion
3. Entrer un email d'un utilisateur existant
4. Vérifier que l'email est envoyé
5. Cliquer sur le lien dans l'email
6. Vérifier la redirection vers l'écran de réinitialisation
7. Entrer un nouveau mot de passe
8. Vérifier la redirection vers la connexion

### 2. Test des cas d'erreur

#### Email non existant
- Entrer un email qui n'existe pas dans la base
- Vérifier que l'erreur est affichée correctement

#### Token expiré/invalide
- Utiliser un ancien lien de réinitialisation
- Vérifier que l'erreur est affichée correctement

#### Mots de passe non conformes
- Tester avec des mots de passe trop courts
- Tester avec des mots de passe non identiques
- Vérifier que les validations fonctionnent

## URLs de test direct

Pour tester directement les composants :

- **Écran "Mot de passe oublié"** : http://localhost:3000/forgot-password
- **Écran de réinitialisation** : http://localhost:3000/reset-password (avec token valide)

## Structure des composants

```
src/components/
├── LoginScreen.jsx (bouton "Mot de passe oublié")
├── ForgotPasswordScreen.jsx (saisie email)
└── ResetPasswordScreen.jsx (nouveau mot de passe)

src/contexts/
└── SupabaseAuthContext.jsx (méthodes requestPasswordReset + updatePasswordWithToken)
```

## Méthodes du contexte

### `requestPasswordReset(email)`
- Vérifie que l'utilisateur existe
- Envoie un email de réinitialisation via Supabase
- Retourne `{ success: true/false, error?: string }`

### `updatePasswordWithToken(newPassword)`
- Met à jour le mot de passe via Supabase Auth
- Hash et sauvegarde dans la table profiles
- Retourne `{ success: true/false, error?: string }`

## Sécurité

- ✅ Vérification de l'existence de l'utilisateur avant envoi d'email
- ✅ Validation des mots de passe côté client et serveur
- ✅ Hashage bcrypt des mots de passe
- ✅ Tokens sécurisés gérés par Supabase Auth
- ✅ Pas de création de nouveaux comptes via ce flux
- ✅ Préservation du système d'inscription contrôlée