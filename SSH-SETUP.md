# 🔐 Configuration SSH pour Déploiement Automatique

## Problème Actuel
Votre serveur `82.25.116.122` utilise l'authentification par mot de passe, ce qui nécessite de saisir le mot de passe plusieurs fois pendant le déploiement.

## Solutions

### Option 1 : Déploiement avec Mot de Passe (Immédiat)
```bash
# Lancer le déploiement (vous devrez taper le mot de passe plusieurs fois)
./deploy-now.sh
```

### Option 2 : Configuration d'une Clé SSH (Recommandé)

#### Sur votre Mac :
```bash
# 1. Générer une clé SSH (si vous n'en avez pas)
ssh-keygen -t rsa -b 4096 -C "deploiement-ges-cab"

# 2. Copier la clé sur le serveur
ssh-copy-id root@82.25.116.122
```

#### Après configuration de la clé :
```bash
# Test sans mot de passe
ssh root@82.25.116.122 "echo 'SSH sans mot de passe OK'"

# Déploiement automatique
./deploy-now.sh
```

## État Actuel du Serveur

### Connexion Testée ✅
- IP : `82.25.116.122`
- Utilisateur : `root`
- Authentification : Mot de passe requis
- Port SSH : 22 (standard)

### Domaines Configurés
- `ges-cab.com`
- `api.ges-cab.com`
- `studio.ges-cab.com`

## Recommandation Immédiate

**Procédez avec le mot de passe pour l'instant :**

```bash
cd /Users/gouzman/Documents/Ges-Cab
./deploy-now.sh
```

Vous devrez saisir le mot de passe root environ 8-10 fois pendant le processus de déploiement (c'est normal).

## Après le Déploiement

Une fois l'application déployée, vous pourrez configurer une clé SSH pour simplifier les futures mises à jour :

```bash
# Sur le serveur, créer un utilisateur pour les déploiements
ssh root@82.25.116.122
adduser deploy
usermod -aG sudo deploy
# Puis configurer la clé SSH pour cet utilisateur
```