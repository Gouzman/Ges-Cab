# 🎯 GUIDE ÉTAPE PAR ÉTAPE - Configuration DNS Hostinger

## 📋 Objectif
Faire pointer `ges-cab.com` de `84.32.84.32` (Hostinger) vers `82.25.116.122` (votre serveur)

---

## 🔧 ÉTAPE 1 : Connexion à Hostinger

### 1.1 Ouvrir le panel Hostinger
1. **Allez sur** : https://hpanel.hostinger.com
2. **Ou** : https://www.hostinger.fr → cliquez "**Se connecter**"

### 1.2 Se connecter
1. **Entrez** votre email et mot de passe Hostinger
2. **Cliquez** "Se connecter"

---

## 🌐 ÉTAPE 2 : Accéder à la gestion des domaines

### 2.1 Dans le tableau de bord Hostinger
Cherchez une de ces sections :
- **"Domaines"** 
- **"Domains"**
- **"Mes domaines"**
- **"Domain Management"**

### 2.2 Sélectionner votre domaine
1. **Trouvez** `ges-cab.com` dans la liste
2. **Cliquez** dessus

---

## ⚙️ ÉTAPE 3 : Trouver la gestion DNS

### 3.1 Chercher la section DNS
Dans les options du domaine, cherchez :
- **"DNS Zone Editor"** ⭐ (nom le plus probable)
- **"DNS Records"**
- **"Manage DNS"** 
- **"Zone DNS"**
- **"DNS/Nameservers"**

### 3.2 Accéder aux enregistrements
1. **Cliquez** sur la section DNS trouvée
2. Vous devriez voir une **table avec des enregistrements**

---

## 📝 ÉTAPE 4 : Modifier les enregistrements DNS

### 4.1 État actuel (à supprimer/modifier)
Vous devriez voir quelque chose comme :
```
Type: A    Name: @    Value: 84.32.84.32
```

### 4.2 Actions à faire

#### ✅ **SUPPRIMER** les anciens enregistrements :
- Tous les enregistrements A pointant vers `84.32.84.32`
- Les enregistrements CNAME vers Hostinger (s'il y en a)

#### ✅ **AJOUTER** ces 4 nouveaux enregistrements A :

| **Type** | **Name/Host** | **Points to/Value** | **TTL** |
|----------|---------------|---------------------|---------|
| A        | @             | 82.25.116.122       | 14400   |
| A        | www           | 82.25.116.122       | 14400   |
| A        | api           | 82.25.116.122       | 14400   |
| A        | studio        | 82.25.116.122       | 14400   |

### 4.3 Comment ajouter un enregistrement
1. **Cliquez** "Add Record" ou "Ajouter" ou "+"
2. **Sélectionnez** Type : **A**
3. **Dans Name/Host** : tapez `@` (puis `www`, puis `api`, puis `studio`)
4. **Dans Value/Points to** : tapez `82.25.116.122`
5. **TTL** : laissez par défaut ou mettez `14400`
6. **Cliquez** "Save" ou "Ajouter"

### 4.4 Répéter pour chaque enregistrement
- Répétez l'opération pour `www`, `api`, et `studio`

---

## 💾 ÉTAPE 5 : Sauvegarder

### 5.1 Sauvegarder les modifications
1. **Cliquez** "Save Changes" ou "Enregistrer"
2. **Attendez** la confirmation (popup ou message vert)

### 5.2 Désactiver le proxy (si présent)
Si vous voyez une option **"Proxy"** ou **"CDN"** :
1. **Désactivez-la** (bouton OFF ou décoché)
2. **Sauvegardez** à nouveau

---

## 🔍 ÉTAPE 6 : Vérifier la propagation

### 6.1 Lancer la surveillance automatique
Dans votre terminal :
```bash
./monitor-dns-propagation.sh
```

### 6.2 Ce que vous allez voir
```
🌐 Vérification de ges-cab.com...
  ⏳ ges-cab.com → 84.32.84.32 (ANCIEN - propagation en cours...)

↓ Après quelques minutes ↓

🌐 Vérification de ges-cab.com...
  ✅ ges-cab.com → 82.25.116.122 (NOUVEAU - OK !)
```

---

## ⏰ ÉTAPE 7 : Attendre la propagation

### 7.1 Temps d'attente
- **Minimum** : 15 minutes
- **Moyen** : 1-2 heures
- **Maximum** : (rarement) 4-6 heures

### 7.2 Pendant l'attente
- **Laissez** le script `monitor-dns-propagation.sh` tourner
- **Ou** vérifiez manuellement : `nslookup ges-cab.com`

---

## 🎉 ÉTAPE 8 : Activation HTTPS (après propagation)

### 8.1 Quand tous les domaines sont OK
Le script vous dira :
```
🎉 PROPAGATION TERMINÉE ! TOUS LES DOMAINES SONT CONFIGURÉS !
```

### 8.2 Activer HTTPS
```bash
./enable-https-complete.sh
```

---

## 🚨 SI VOUS ÊTES BLOQUÉ

### Option 1 : Support Hostinger
1. **Chat en direct** : Dans votre panel Hostinger (coin bas-droite)
2. **Dites** : "Je veux modifier les enregistrements DNS A pour ges-cab.com vers 82.25.116.122"

### Option 2 : Vérification
```bash
./diagnose-hostinger.sh
```

### Option 3 : Screenshots
Si vous ne trouvez pas, faites une capture d'écran de votre panel et cherchez "DNS" dans les menus.

---

## 🎯 RÉSULTAT FINAL

Après configuration complète :
- **http://ges-cab.com** → redirige vers **https://www.ges-cab.com** 
- **https://www.ges-cab.com** → Votre application Ges-Cab ✅
- **https://api.ges-cab.com** → API Supabase ✅  
- **https://studio.ges-cab.com** → Studio Supabase ✅

---

## 📋 CHECKLIST

- [ ] ✅ Connexion à Hostinger
- [ ] ✅ Accès à la gestion DNS
- [ ] ✅ Suppression anciens enregistrements (84.32.84.32)
- [ ] ✅ Ajout enregistrement A : @ → 82.25.116.122
- [ ] ✅ Ajout enregistrement A : www → 82.25.116.122  
- [ ] ✅ Ajout enregistrement A : api → 82.25.116.122
- [ ] ✅ Ajout enregistrement A : studio → 82.25.116.122
- [ ] ✅ Sauvegarde des modifications
- [ ] ✅ Lancement surveillance : `./monitor-dns-propagation.sh`
- [ ] ✅ Attente propagation (15min - 2h)
- [ ] ✅ Activation HTTPS : `./enable-https-complete.sh`

**Suivez cette checklist étape par étape et tout se passera bien ! 🚀**