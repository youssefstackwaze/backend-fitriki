# 🚀 Guide de Déploiement sur OVH

Ce guide détaille comment déployer votre backend sur un serveur OVH (VPS).

## 📋 Prérequis

- Un serveur VPS OVH (Ubuntu 20.04/22.04 recommandé)
- Accès SSH à votre serveur
- Un nom de domaine (optionnel mais recommandé)
- MongoDB Atlas configuré (ou MongoDB sur le serveur)

## 🎯 Vue d'ensemble du déploiement

1. Connexion au serveur OVH
2. Installation de Node.js et des outils nécessaires
3. Configuration du projet
4. Installation de PM2 pour la gestion des processus
5. Configuration de Nginx comme reverse proxy
6. Sécurisation avec SSL (Let's Encrypt)
7. Configuration du firewall

---

## 🔧 Étape 1 : Connexion au serveur OVH

### 1.1 Se connecter via SSH

```bash
ssh ubuntu@votre-ip-ovh
# ou
ssh root@votre-ip-ovh
```

> **Note**: Remplacez `votre-ip-ovh` par l'adresse IP de votre serveur.

### 1.2 Mettre à jour le système

```bash
sudo apt update
sudo apt upgrade -y
```

---

## 🟢 Étape 2 : Installation de Node.js

### 2.1 Installer Node.js 18.x (LTS)

```bash
# Ajouter le repository NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Installer Node.js
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version  # devrait afficher v18.x.x
npm --version   # devrait afficher v9.x.x
```

### 2.2 Installer les outils de build

```bash
sudo apt-get install -y build-essential
```

---

## 📂 Étape 3 : Configuration du projet

### 3.1 Créer un utilisateur dédié (recommandé pour la sécurité)

```bash
# Créer un utilisateur
sudo adduser covoiturage
sudo usermod -aG sudo covoiturage

# Passer à cet utilisateur
su - covoiturage
```

### 3.2 Installer Git

```bash
sudo apt install git -y
git --version
```

### 3.3 Cloner votre projet

**Option A : Via GitHub (recommandé)**

```bash
# Créer le répertoire de travail
mkdir -p ~/apps
cd ~/apps

# Cloner votre repository
git clone https://github.com/votre-username/projet-covoiturage.git
cd projet-covoiturage/backend
```

**Option B : Via SCP (upload direct)**

Depuis votre machine locale :
```bash
# Depuis votre PC Windows
scp -r C:\Users\youss\OneDrive\Bureau\projet-covoiturage\backend ubuntu@votre-ip-ovh:~/apps/
```

### 3.4 Installer les dépendances

```bash
cd ~/apps/projet-covoiturage/backend
npm install
```

### 3.5 Créer le fichier .env

```bash
nano .env
```

Copiez et ajustez le contenu suivant :

```env
# Environnement
NODE_ENV=production
PORT=3000
APP_NAME=Covoiturage

# Base de données MongoDB
MONGODB_URI=mongodb+srv://votre-user:votre-password@cluster0.puydf.mongodb.net/covoiturage?retryWrites=true&w=majority

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise_production_xyz123
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=votre_secret_refresh_token_production_abc456
JWT_REFRESH_EXPIRES_IN=30d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-app-password
SMTP_FROM=votre-email@gmail.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=votre-account-sid
TWILIO_AUTH_TOKEN=votre-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary (pour upload d'images)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Frontend URL (pour CORS)
FRONTEND_URL=https://votre-domaine.com

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Sauvegardez** : `Ctrl + X`, puis `Y`, puis `Entrée`

### 3.6 Compiler le projet TypeScript

```bash
npm run build
```

Vérifiez que le dossier `dist` a été créé :
```bash
ls -la dist/
```

---

## ⚙️ Étape 4 : Installation et configuration de PM2

PM2 est un gestionnaire de processus qui gardera votre application en ligne.

### 4.1 Installer PM2

```bash
sudo npm install -g pm2
```

### 4.2 Créer un fichier de configuration PM2

```bash
nano ecosystem.config.js
```

Contenu :
```javascript
module.exports = {
  apps: [{
    name: 'covoiturage-api',
    script: './dist/server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
```

### 4.3 Créer le dossier logs

```bash
mkdir -p logs
```

### 4.4 Démarrer l'application avec PM2

```bash
pm2 start ecosystem.config.js
```

### 4.5 Vérifier le statut

```bash
pm2 status
pm2 logs covoiturage-api
```

### 4.6 Configurer PM2 pour démarrer au boot

```bash
pm2 startup
# Copier et exécuter la commande affichée, exemple :
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u covoiturage --hp /home/covoiturage

pm2 save
```

### 4.7 Commandes PM2 utiles

```bash
# Voir les logs
pm2 logs

# Redémarrer l'app
pm2 restart covoiturage-api

# Arrêter l'app
pm2 stop covoiturage-api

# Recharger (zero-downtime)
pm2 reload covoiturage-api

# Monitorer
pm2 monit
```

---

## 🌐 Étape 5 : Installation et configuration de Nginx

Nginx servira de reverse proxy pour votre API.

### 5.1 Installer Nginx

```bash
sudo apt install nginx -y
```

### 5.2 Créer la configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/covoiturage-api
```

**Si vous avez un nom de domaine :**

```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;

    # Limite de taille d'upload (pour les photos de profil)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Si vous n'avez PAS de nom de domaine (utiliser l'IP) :**

```nginx
server {
    listen 80;
    server_name votre-ip-ovh;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 5.3 Activer la configuration

```bash
# Créer un lien symbolique
sudo ln -s /etc/nginx/sites-available/covoiturage-api /etc/nginx/sites-enabled/

# Supprimer la config par défaut (optionnel)
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### 5.4 Vérifier que Nginx fonctionne

```bash
sudo systemctl status nginx
```

---

## 🔒 Étape 6 : Sécurisation avec SSL (Let's Encrypt)

**⚠️ Uniquement si vous avez un nom de domaine**

### 6.1 Installer Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Obtenir un certificat SSL

```bash
sudo certbot --nginx -d api.votre-domaine.com
```

Suivez les instructions :
- Entrez votre email
- Acceptez les termes
- Choisissez de rediriger HTTP vers HTTPS (option 2)

### 6.3 Renouvellement automatique

Le certificat se renouvelle automatiquement. Vous pouvez tester avec :

```bash
sudo certbot renew --dry-run
```

---

## 🔥 Étape 7 : Configuration du Firewall

### 7.1 Installer UFW (s'il n'est pas installé)

```bash
sudo apt install ufw -y
```

### 7.2 Configurer les règles

```bash
# Autoriser SSH (IMPORTANT : à faire en premier)
sudo ufw allow 22/tcp

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Vérifier les règles
sudo ufw status

# Activer le firewall
sudo ufw enable
```

### 7.3 Vérifier le statut

```bash
sudo ufw status verbose
```

---

## ✅ Étape 8 : Tests et vérification

### 8.1 Tester l'API localement sur le serveur

```bash
curl http://localhost:3000/health
```

### 8.2 Tester via Nginx

**Avec nom de domaine :**
```bash
curl http://api.votre-domaine.com/health
# ou
curl https://api.votre-domaine.com/health
```

**Avec IP :**
```bash
curl http://votre-ip-ovh/health
```

### 8.3 Tester depuis votre PC

Ouvrez un navigateur et allez sur :
- `https://api.votre-domaine.com/health` (avec domaine)
- `http://votre-ip-ovh/health` (avec IP)

Vous devriez voir :
```json
{
  "success": true,
  "message": "API Covoiturage - Serveur opérationnel",
  "timestamp": "2025-10-24T...",
  "environment": "production"
}
```

---

## 🔄 Mise à jour du code

### Méthode 1 : Via Git (recommandé)

```bash
cd ~/apps/projet-covoiturage/backend

# Sauvegarder les changements locaux si nécessaire
git stash

# Récupérer les dernières modifications
git pull origin main

# Réinstaller les dépendances (si package.json a changé)
npm install

# Recompiler
npm run build

# Redémarrer l'application
pm2 restart covoiturage-api

# Vérifier les logs
pm2 logs covoiturage-api
```

### Méthode 2 : Via SCP

```bash
# Depuis votre PC, uploader les nouveaux fichiers
scp -r C:\Users\youss\OneDrive\Bureau\projet-covoiturage\backend ubuntu@votre-ip-ovh:~/apps/projet-covoiturage/

# Sur le serveur
cd ~/apps/projet-covoiturage/backend
npm install
npm run build
pm2 restart covoiturage-api
```

---

## 📊 Monitoring et maintenance

### Voir les logs

```bash
# Logs PM2
pm2 logs covoiturage-api

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs système
sudo journalctl -u nginx -f
```

### Monitoring des ressources

```bash
# CPU et RAM
pm2 monit

# Espace disque
df -h

# RAM
free -h

# Processus
htop  # (installer avec: sudo apt install htop)
```

### Redémarrage du serveur

```bash
sudo reboot
```

Après le redémarrage, PM2 redémarrera automatiquement votre application (si vous avez exécuté `pm2 startup` et `pm2 save`).

---

## 🔧 Configuration de MongoDB Atlas

Si vous utilisez MongoDB Atlas (recommandé) :

### 1. Whitelist l'IP du serveur OVH

1. Allez sur https://cloud.mongodb.com
2. Cliquez sur **Network Access**
3. Cliquez sur **Add IP Address**
4. Entrez l'IP de votre serveur OVH
5. Cliquez sur **Confirm**

### 2. Vérifier la connexion

```bash
# Tester la connexion MongoDB depuis le serveur
cd ~/apps/projet-covoiturage/backend
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ MongoDB connecté')).catch(err => console.error('❌ Erreur:', err.message));"
```

---

## 🚨 Dépannage

### L'API ne démarre pas

```bash
# Vérifier les logs
pm2 logs covoiturage-api

# Vérifier les variables d'environnement
cat .env

# Tester le build
npm run build

# Essayer de démarrer manuellement
node dist/server.js
```

### Nginx retourne 502 Bad Gateway

```bash
# Vérifier que PM2 tourne
pm2 status

# Vérifier que l'app écoute sur le port 3000
sudo netstat -tlnp | grep 3000

# Redémarrer PM2
pm2 restart covoiturage-api

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log
```

### Problème de permissions

```bash
# Vérifier les permissions du dossier
ls -la ~/apps/projet-covoiturage/backend

# Ajuster si nécessaire
sudo chown -R covoiturage:covoiturage ~/apps/projet-covoiturage
```

### L'application consomme trop de RAM

```bash
# Redémarrer l'app
pm2 restart covoiturage-api

# Voir la consommation
pm2 monit

# Configurer une limite de RAM dans ecosystem.config.js
# max_memory_restart: '500M'
```

---

## 📱 Mettre à jour l'URL de l'API dans l'application mobile

Modifiez le fichier `covoiturage-app/config/api.ts` :

```typescript
// Avant
export const API_URL = 'http://localhost:3000/api';

// Après (avec domaine)
export const API_URL = 'https://api.votre-domaine.com/api';

// Après (avec IP)
export const API_URL = 'http://votre-ip-ovh/api';
```

Puis recompilez votre application mobile.

---

## 🎉 Félicitations !

Votre backend est maintenant déployé sur OVH !

### URLs à retenir

- **API URL** : `https://api.votre-domaine.com` ou `http://votre-ip-ovh`
- **Health check** : `https://api.votre-domaine.com/health`
- **Documentation API** : Voir le fichier `API.md`

### Commandes utiles au quotidien

```bash
# Se connecter au serveur
ssh ubuntu@votre-ip-ovh

# Voir le statut de l'API
pm2 status

# Voir les logs
pm2 logs

# Redémarrer l'API
pm2 restart covoiturage-api

# Mettre à jour le code
cd ~/apps/projet-covoiturage/backend && git pull && npm install && npm run build && pm2 restart covoiturage-api
```

---

## 📞 Besoin d'aide ?

- Vérifiez les logs : `pm2 logs`
- Consultez la documentation : `backend/README.md`
- Testez localement d'abord

Bon déploiement ! 🚀

