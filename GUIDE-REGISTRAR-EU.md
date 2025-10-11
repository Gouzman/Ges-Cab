# 🌐 Guide DNS Registrar.eu pour ges-cab.com

## 📋 Informations actuelles
- **Domaine** : ges-cab.com
- **Registraire** : Registrar.eu (Hosting Concepts B.V.)
- **IP actuelle** : 84.32.84.32
- **IP cible** : 82.25.116.122

## 🔧 Étapes de configuration

### **1. Connexion au panel**
1. Allez sur : https://www.registrar.eu
2. Cliquez sur "Login" ou "Client Area"
3. Connectez-vous avec vos identifiants

### **2. Accès à la gestion DNS**
1. Trouvez votre domaine `ges-cab.com` dans la liste
2. Cliquez sur le domaine
3. Cherchez une section :
   - "DNS Management"
   - "DNS Records" 
   - "Zone File"
   - "Name Servers"

### **3. Modification des enregistrements**

#### **Supprimez** l'ancien enregistrement :
```
Type: A
Host: @ ou ges-cab.com
Value: 84.32.84.32
```

#### **Ajoutez** ces 4 nouveaux enregistrements :

```
1️⃣ Type: A    Host: @        Value: 82.25.116.122    TTL: 3600
2️⃣ Type: A    Host: www      Value: 82.25.116.122    TTL: 3600  
3️⃣ Type: A    Host: api      Value: 82.25.116.122    TTL: 3600
4️⃣ Type: A    Host: studio   Value: 82.25.116.122    TTL: 3600
```

### **4. Sauvegarde**
- Cliquez sur "Save" ou "Apply Changes"
- Attendez la confirmation

## ⏰ Temps de propagation
- **Minimum** : 15-30 minutes
- **Moyen** : 2-4 heures  
- **Maximum** : 24-48 heures

## 🔍 Surveillance automatique

Une fois les modifications DNS faites :

```bash
./monitor-dns-propagation.sh
```

Ce script va :
- ✅ Surveiller la propagation en temps réel
- 📊 Afficher le statut de chaque domaine
- 🎉 Vous alerter quand c'est terminé

## 🚨 En cas de problème

Si vous ne trouvez pas la gestion DNS :
1. Contactez le support Registrar.eu
2. Email : support@registrar.eu
3. Demandez l'accès à la gestion DNS pour ges-cab.com

## ✅ Vérification manuelle

```bash
# Vérification rapide
nslookup ges-cab.com

# Vérification complète  
./check-dns-complete.sh
```

## 🎯 Résultat attendu

Après propagation :
```
ges-cab.com        → 82.25.116.122
www.ges-cab.com    → 82.25.116.122
api.ges-cab.com    → 82.25.116.122
studio.ges-cab.com → 82.25.116.122
```