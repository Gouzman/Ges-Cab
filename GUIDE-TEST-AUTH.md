# 🧪 Guide de Test - Nouveau Système d'Authentification

## 📋 RÉSUMÉ DES MODIFICATIONS

Toutes les fonctionnalités demandées ont été implémentées avec succès :

### ✅ **Fonctionnalités Réalisées**

1. **👨‍💼 Création d'utilisateurs par l'administrateur**
   - Interface dans Paramètres → Utilisateurs
   - Saisie : nom, email, fonction, rôle
   - Génération automatique de mot de passe temporaire

2. **🔑 Première connexion avec mot de passe temporaire**
   - Validation du mot de passe temporaire
   - Interface de choix : conserver ou changer
   - Finalisation du compte avec `first_login = false`

3. **🔄 Mot de passe oublié**
   - Bouton "Mot de passe oublié" sur l'écran de connexion
   - Génération de nouveau mot de passe temporaire
   - Process complet de réinitialisation

4. **🔐 Sécurité intégrée**
   - Expiration des mots de passe temporaires
   - Chiffrement via Supabase Auth
   - Politiques RLS pour la protection des données

---

## 🚀 ÉTAPES POUR TESTER

### **1. Appliquer la Migration SQL**

1. Connectez-vous à votre [Supabase Dashboard](https://supabase.com/dashboard)
2. Allez dans **SQL Editor**
3. Copiez le contenu du fichier `database/auth-system-migration.sql`
4. Exécutez la migration
5. Vérifiez que les nouvelles colonnes et fonctions sont créées

### **2. Tester localement**

```bash
# Lancer l'application en développement
npm run dev
```

### **3. Test Complet du Workflow**

#### **Étape 1: Créer un utilisateur (Admin)**
1. Connectez-vous avec votre compte admin existant
2. Allez dans **Paramètres**
3. Cliquez sur l'onglet **Utilisateurs**
4. Cliquez sur **Nouvel Utilisateur**
5. Remplissez le formulaire :
   - Email : `test@exemple.com`
   - Nom : `Jean Dupont`
   - Fonction : `Avocat`
   - Rôle : `user`
6. Cliquez sur **Créer**
7. ✅ Un mot de passe temporaire doit s'afficher (ex: `AB123CD4`)

#### **Étape 2: Première connexion (Utilisateur)**
1. Déconnectez-vous de votre session admin
2. Sur l'écran de connexion, saisissez : `test@exemple.com`
3. ✅ Le système doit détecter que c'est une première connexion
4. Saisissez le mot de passe temporaire reçu
5. ✅ Interface de choix doit apparaître :
   - Option 1 : Conserver le mot de passe temporaire
   - Option 2 : Définir un nouveau mot de passe
6. Testez les deux options

#### **Étape 3: Mot de passe oublié**
1. Sur l'écran de connexion normal, cliquez **Mot de passe oublié**
2. Saisissez l'email de l'utilisateur test
3. ✅ Un nouveau mot de passe temporaire doit être généré
4. Utilisez ce mot de passe pour vous connecter
5. Définissez un nouveau mot de passe

---

## 🔍 POINTS DE VÉRIFICATION

### **Base de Données**
- [ ] Colonnes ajoutées à `profiles` : `first_login`, `temp_password`, `temp_password_expires_at`, `created_by`
- [ ] Fonctions créées : `generate_temp_password()`, `admin_create_user()`, `validate_temp_password()`, etc.
- [ ] Vue `admin_users_view` créée
- [ ] Politiques RLS activées

### **Interface Utilisateur**
- [ ] Onglet "Utilisateurs" dans Paramètres (admin uniquement)
- [ ] Formulaire de création d'utilisateur
- [ ] Affichage du mot de passe temporaire généré
- [ ] Écran de première connexion avec choix
- [ ] Écran de mot de passe oublié
- [ ] Bouton "Mot de passe oublié" sur la connexion

### **Logique Métier**
- [ ] Détection automatique première connexion vs connexion normale
- [ ] Expiration des mots de passe temporaires
- [ ] Finalisation du compte (`first_login = false`)
- [ ] Réinitialisation de mot de passe
- [ ] Permissions admin pour créer des utilisateurs

---

## 🐛 DÉPANNAGE

### **Erreur de Migration**
Si la migration SQL échoue :
1. Vérifiez que vous êtes connecté en tant que propriétaire du projet
2. Assurez-vous que la table `profiles` existe
3. Exécutez les commandes une à une si besoin

### **Problème de Permissions**
Si l'onglet Utilisateurs n'apparaît pas :
1. Vérifiez que votre utilisateur a `function = 'Gerant'` ou `role = 'admin'`
2. Rechargez la page après modification

### **Mot de Passe Temporaire Non Reconnu**
1. Vérifiez l'expiration dans la base de données
2. Assurez-vous de saisir exactement le mot de passe (8 caractères alphanumériques)
3. Vérifiez que `first_login = true` pour l'utilisateur

---

## 📧 INTÉGRATION EMAIL (FUTUR)

Pour l'instant, les mots de passe temporaires sont affichés dans l'interface admin. Pour la production, il faudra intégrer un service d'email :

```javascript
// Exemple d'intégration avec Resend
const sendTempPassword = async (email, tempPassword) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@ges-cab.com',
      to: email,
      subject: 'Votre mot de passe temporaire - Ges-Cab',
      html: `Votre mot de passe temporaire est : <strong>${tempPassword}</strong>`
    }),
  });
};
```

---

## ✅ **SUCCÈS !**

Toutes les fonctionnalités demandées ont été implémentées :
- ✅ Création d'utilisateurs par l'admin
- ✅ Mots de passe temporaires automatiques
- ✅ Première connexion guidée
- ✅ Choix de conserver/changer le mot de passe
- ✅ Système de mot de passe oublié
- ✅ Sécurité et expiration intégrées
- ✅ Compatible avec le code existant

Le système est prêt à être utilisé ! 🚀