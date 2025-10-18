# 🔧 GUIDE DE CORRECTION MANUELLE - Infrastructure Ges-Cab
# =========================================================
# À exécuter sur le serveur SSH : root@82.25.116.122

## ÉTAPE 1: Connexion SSH
```bash
ssh root@82.25.116.122
```

## ÉTAPE 2: Diagnostic initial
```bash
# Vérifier les services en cours
ps aux | grep -E '(supabase|kong|postgres)' | grep -v grep

# Vérifier les ports
netstat -tlnp | grep -E ':(80|443|8000|54321|54323)'

# Vérifier les logs Nginx
tail -20 /var/log/nginx/error.log
```

## ÉTAPE 3: Corriger le problème du Frontend (401)
```bash
# Faire une sauvegarde
cp /etc/nginx/sites-available/ges-cab.com /etc/nginx/sites-available/ges-cab.com.backup

# Éditer la configuration
nano /etc/nginx/sites-available/ges-cab.com

# DANS LE FICHIER, CHERCHER ET COMMENTER CES LIGNES :
# auth_basic "Restricted";
# auth_basic_user_file /etc/nginx/.htpasswd;

# OU SUPPRIMER LA SECTION Kong Basic Auth
```

## ÉTAPE 4: Ajouter les headers CORS
```bash
# Ajouter dans chaque block location / dans la config Nginx :

    # Headers CORS
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
    add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Client-Info, apikey' always;
    
    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Client-Info, apikey' always;
        add_header 'Access-Control-Max-Age' 1728000 always;
        add_header 'Content-Type' 'text/plain; charset=utf-8' always;
        add_header 'Content-Length' 0 always;
        return 204;
    }
```

## ÉTAPE 5: Redémarrer Studio Supabase
```bash
# Méthode 1: Docker (si utilisé)
cd /opt/supabase  # ou /home/supabase
docker-compose up -d supabase-studio

# Méthode 2: Service systemd
systemctl start supabase-studio
systemctl enable supabase-studio

# Méthode 3: CLI Supabase
supabase start
```

## ÉTAPE 6: Appliquer les corrections
```bash
# Tester la config Nginx
nginx -t

# Si OK, redémarrer
systemctl reload nginx

# Vérifier les services
systemctl status nginx
systemctl status supabase-studio
```

## ÉTAPE 7: Tests finaux
```bash
# Test local
curl http://localhost:3000/
curl http://localhost:54323/
curl http://localhost:54321/rest/v1/

# Test externe
curl https://ges-cab.com/
curl https://studio.ges-cab.com/
curl https://api.ges-cab.com/rest/v1/
```

## FICHIERS IMPORTANTS À VÉRIFIER :
- `/etc/nginx/sites-available/ges-cab.com`
- `/etc/nginx/sites-available/api.ges-cab.com`  
- `/etc/nginx/sites-available/studio.ges-cab.com`
- `/var/log/nginx/error.log`
- `/var/log/nginx/access.log`

## EN CAS DE PROBLÈME :
```bash
# Restaurer la sauvegarde
cp /etc/nginx/sites-available/ges-cab.com.backup /etc/nginx/sites-available/ges-cab.com
systemctl reload nginx

# Voir les logs en temps réel
tail -f /var/log/nginx/error.log
```