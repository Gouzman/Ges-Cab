# 🌐 Guide de Configuration DNS pour Ges-Cab

## 📋 Enregistrements DNS à créer

Vous devez créer **4 enregistrements de type A** dans votre panel de gestion DNS :

```
Nom/Host               Type    Valeur/Target     TTL
---------------------------------------------------
ges-cab.com           A       82.25.116.122     3600
www.ges-cab.com       A       82.25.116.122     3600
api.ges-cab.com       A       82.25.116.122     3600
studio.ges-cab.com    A       82.25.116.122     3600
```

## 🔧 Configuration par registraire

### **OVH**
1. Connectez-vous à votre espace client OVH
2. Allez dans "Noms de domaine" → "ges-cab.com"
3. Cliquez sur l'onglet "Zone DNS"
4. Cliquez sur "Ajouter une entrée"
5. Sélectionnez "A"
6. Remplissez :
   - **Sous-domaine** : (vide pour ges-cab.com, "www" pour www.ges-cab.com, etc.)
   - **TTL** : 3600
   - **Cible** : 82.25.116.122

### **Cloudflare**
1. Connectez-vous à Cloudflare
2. Sélectionnez votre domaine "ges-cab.com"
3. Allez dans "DNS" → "Records"
4. Cliquez sur "Add record"
5. Remplissez :
   - **Type** : A
   - **Name** : @ (pour ges-cab.com), www, api, studio
   - **IPv4 address** : 82.25.116.122
   - **Proxy status** : DNS only (nuage gris)
   - **TTL** : Auto

### **Gandi**
1. Connectez-vous à votre compte Gandi
2. Allez dans "Domaines" → "ges-cab.com"
3. Cliquez sur "Enregistrements DNS"
4. Cliquez sur "Ajouter"
5. Remplissez :
   - **Type** : A
   - **Nom** : @ (pour ges-cab.com), www, api, studio
   - **Valeur** : 82.25.116.122
   - **TTL** : 10800

### **Namecheap**
1. Connectez-vous à Namecheap
2. Allez dans "Domain List" → "Manage" pour ges-cab.com
3. Cliquez sur "Advanced DNS"
4. Cliquez sur "Add New Record"
5. Remplissez :
   - **Type** : A Record
   - **Host** : @ (pour ges-cab.com), www, api, studio
   - **Value** : 82.25.116.122
   - **TTL** : Automatic

## ⏰ Temps de propagation

- **Minimum** : 15 minutes
- **Moyen** : 2-4 heures
- **Maximum** : 24-48 heures

## 🔍 Vérification

Utilisez ces commandes pour vérifier :

```bash
# Vérification automatique
./check-dns-complete.sh

# Vérification manuelle
nslookup www.ges-cab.com
dig www.ges-cab.com
```

## 🔐 Activation HTTPS

Une fois le DNS propagé :

```bash
./enable-https-complete.sh
```

## 🎯 URLs finales

Après configuration complète :

- **Application** : https://www.ges-cab.com
- **API** : https://api.ges-cab.com  
- **Studio** : https://studio.ges-cab.com

## ⚠️ Remarques importantes

1. **ges-cab.com** redirige automatiquement vers **www.ges-cab.com**
2. **HTTP** redirige automatiquement vers **HTTPS**
3. Les certificats SSL se renouvellent automatiquement
4. Toutes les connexions sont sécurisées et chiffrées