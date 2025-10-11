# 🌐 Guide DNS Hostinger pour ges-cab.com

## 📋 Situation actuelle
- **Domaine** : ges-cab.com
- **Hébergeur** : Hostinger  
- **État** : Affiche la landing page Hostinger
- **Serveur** : hcdn (Hostinger CDN)
- **IP cible** : 82.25.116.122

## 🔧 Configuration DNS sur Hostinger

### **1. Connexion au panel Hostinger**
1. Allez sur : https://hpanel.hostinger.com
2. Connectez-vous avec vos identifiants Hostinger
3. Ou allez sur : https://www.hostinger.fr puis "Se connecter"

### **2. Accès à la gestion DNS**
1. Dans le tableau de bord, cherchez "Domaines" ou "Domain"
2. Cliquez sur votre domaine `ges-cab.com`
3. Cherchez une section :
   - "DNS / Nameservers"
   - "DNS Zone Editor" 
   - "DNS Records"
   - "Manage DNS"

### **3. Modification des enregistrements**

#### **⚠️ IMPORTANT : Désactiver le proxy Hostinger**
Si vous voyez une option "Proxy" ou "CDN", **désactivez-la** pour ges-cab.com

#### **Remplacez tous les enregistrements A existants par :**

```
🎯 NOUVEAUX ENREGISTREMENTS A :

1️⃣ Type: A    Name: @        Points to: 82.25.116.122    TTL: 14400
2️⃣ Type: A    Name: www      Points to: 82.25.116.122    TTL: 14400  
3️⃣ Type: A    Name: api      Points to: 82.25.116.122    TTL: 14400
4️⃣ Type: A    Name: studio   Points to: 82.25.116.122    TTL: 14400
```

#### **Supprimez** ces enregistrements s'ils existent :
- Enregistrements CNAME pointant vers Hostinger
- Enregistrements A pointant vers des IPs Hostinger
- Redirections automatiques

### **4. Interface Hostinger - Captures d'écran types**

L'interface peut ressembler à :
```
┌─────────────────────────────────────┐
│ DNS Zone Editor                      │
├─────────────────────────────────────┤
│ Type │ Name │ Points to │ TTL        │
├─────────────────────────────────────┤
│  A   │  @   │ 82.25... │ 14400      │
│  A   │ www  │ 82.25... │ 14400      │
│  A   │ api  │ 82.25... │ 14400      │
│  A   │studio│ 82.25... │ 14400      │
└─────────────────────────────────────┘
```

### **5. Sauvegarde et propagation**
1. Cliquez sur "Save Changes" ou "Update"
2. Attendez la confirmation
3. La propagation peut prendre 15 minutes à 4 heures

## 🔍 Vérification immédiate

Après modification, testez immédiatement :

```bash
# Surveillance automatique
./monitor-dns-propagation.sh

# Vérification manuelle
nslookup ges-cab.com
```

## 🚨 Si vous ne trouvez pas la gestion DNS

### **Option 1 : Support Hostinger**
- Chat en direct sur hpanel.hostinger.com
- Email : support@hostinger.com
- Demandez : "Comment modifier les enregistrements DNS pour ges-cab.com ?"

### **Option 2 : Rechercher dans le panel**
Cherchez ces termes dans le menu :
- "DNS"
- "Domain"
- "Nameservers" 
- "Zone Editor"
- "Records"

## ⚡ Propagation rapide Hostinger

Hostinger a généralement :
- **Propagation interne** : 5-15 minutes
- **Propagation globale** : 30 minutes à 2 heures

## ✅ Test de réussite

Quand c'est bon, vous verrez :
```bash
$ nslookup ges-cab.com
Name: ges-cab.com
Address: 82.25.116.122
```

Au lieu de la landing page Hostinger, vous verrez votre application Ges-Cab !

## 🎯 Prochaines étapes

1. **Modifiez le DNS** dans Hostinger
2. **Lancez la surveillance** : `./monitor-dns-propagation.sh`  
3. **Activez HTTPS** : `./enable-https-complete.sh` (après propagation)