# 🔧 Guide d'Installation du Système de Permissions

## 📋 Instructions d'Exécution

### ❌ **Erreurs Corrigées**
1. **Erreur `syntax error at or near "NOT"`** - Corrigée en remplaçant `IF NOT EXISTS` pour les politiques
2. **Erreur `column "updated_at" does not exist`** - Supprimée la colonne `updated_at` de la table `user_permissions`
3. **Erreur `column reference "permissions" is ambiguous`** - Ajouté les alias de table appropriés

### ✅ **Solution : Exécution en Étapes**

Au lieu d'exécuter le script complet, utilisez les scripts séparés dans l'ordre suivant :

## 🚀 **Procédure d'Installation**

### **1. Accéder à Supabase**
```
1. Ouvrir le Dashboard Supabase
2. Sélectionner votre projet Ges-Cab  
3. Aller dans "SQL Editor"
4. Créer une nouvelle requête
```

### **2. Exécuter les Scripts dans l'Ordre**

#### **ÉTAPE 1 : Tables de Base**
```sql
-- Copier/coller le contenu de : setup-step1-tables.sql
-- Cliquer sur "Run" ou Ctrl+Enter
```

#### **ÉTAPE 2 : Index et Fonctions**
```sql
-- Copier/coller le contenu de : setup-step2-indexes.sql  
-- Cliquer sur "Run" ou Ctrl+Enter
```

#### **ÉTAPE 3 : Sécurité RLS**
```sql
-- Copier/coller le contenu de : setup-step3-security.sql
-- Cliquer sur "Run" ou Ctrl+Enter
```

#### **ÉTAPE 4 : Permissions par Défaut**
```sql
-- Copier/coller le contenu de : setup-step4-defaults.sql
-- Cliquer sur "Run" ou Ctrl+Enter
```

#### **ÉTAPE 5 : Permissions Gérants**
```sql
-- Copier/coller le contenu de : setup-step5-manager-perms.sql
-- Cliquer sur "Run" ou Ctrl+Enter
```

### **3. Vérification**
```sql
-- Copier/coller le contenu de : test-permissions-setup.sql
-- Cliquer sur "Run" pour vérifier que tout fonctionne
```

## ⚠️ **Points d'Attention**

### **Si des Erreurs Précédentes Existent :**
```sql
-- Exécuter d'abord le script de nettoyage :
-- cleanup-permissions.sql
-- Puis recommencer l'installation
```

### **Si une Erreur Survient :**
1. **Noter le message d'erreur exacte**
2. **Vérifier que l'étape précédente s'est bien exécutée**
3. **Re-exécuter l'étape qui a échoué**
4. **Continuer avec les étapes suivantes**

### **Messages de Succès Attendus :**
- ✅ `CREATE TABLE` - Tables créées
- ✅ `INSERT 0 6` - Rôles insérés
- ✅ `CREATE INDEX` - Index créés
- ✅ `CREATE FUNCTION` - Fonctions créées
- ✅ `CREATE TRIGGER` - Triggers créés
- ✅ `CREATE POLICY` - Politiques de sécurité

## 🔍 **Vérifications Post-Installation**

### **1. Vérifier les Tables**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'user_permissions');
```

### **2. Vérifier les Permissions d'un Gérant**
```sql
SELECT p.name, up.permissions 
FROM profiles p 
JOIN user_permissions up ON p.id = up.user_id 
WHERE p.function = 'Gerant';
```

### **3. Test de l'Interface**
```
1. Se connecter en tant que Gérant
2. Aller dans Paramètres → Gestion des Permissions  
3. Sélectionner un utilisateur
4. Modifier ses permissions
5. Sauvegarder
6. Vérifier le message de succès
```

## 🎯 **Résolution de Problèmes Courants**

### **Erreur : "relation does not exist"**
```sql
-- Vérifier que la table profiles existe
SELECT * FROM information_schema.tables WHERE table_name = 'profiles';
-- Si elle n'existe pas, créer un utilisateur d'abord via l'interface
```

### **Erreur : "permission denied"**
```sql
-- Vérifier les droits sur le schéma public
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

### **Erreur de Politique RLS**
```sql
-- Désactiver temporairement RLS pour les tests
ALTER TABLE public.user_permissions DISABLE ROW LEVEL SECURITY;
-- Puis réactiver après vérification
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
```

## ✅ **Validation Finale**

Après installation complète, vous devriez avoir :
- ✅ 2 nouvelles tables : `roles` et `user_permissions`
- ✅ 6 rôles prédéfinis dans la table `roles`  
- ✅ Politiques RLS actives pour la sécurité
- ✅ Triggers automatiques pour les nouveaux utilisateurs
- ✅ Permissions complètes pour les gérants existants

## 🚀 **Utilisation**

Une fois l'installation terminée :
1. **Redémarrer l'application** (npm run dev)
2. **Se connecter en tant que Gérant**
3. **Tester la gestion des permissions** dans Paramètres
4. **Créer un utilisateur test** et lui attribuer des permissions
5. **Se connecter avec ce compte** pour vérifier les restrictions

**Le système est maintenant opérationnel !** 🎉