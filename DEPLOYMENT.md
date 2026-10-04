# 🚀 Guide de Déploiement

Ce guide détaille comment déployer l'API backend sur différentes plateformes.

## 📋 Checklist pré-déploiement

- [ ] Toutes les variables d'environnement sont configurées
- [ ] La base de données MongoDB est prête (Atlas recommandé pour la production)
- [ ] Cloudinary est configuré pour l'upload d'images
- [ ] Les secrets JWT sont sécurisés et différents de ceux en développement
- [ ] Le code est testé localement
- [ ] Le fichier `.env` n'est PAS commité (vérifier `.gitignore`)

## 🌐 Option 1: Déploiement sur Render (Recommandé)

Render offre un plan gratuit et une intégration simple.

### Étapes

1. **Créer un compte sur Render**
   - Aller sur https://render.com
   - Se connecter avec GitHub

2. **Créer un nouveau Web Service**
   - Cliquer sur "New +" → "Web Service"
   - Connecter votre repository
   - Sélectionner le dossier `backend`

3. **Configuration du service**
   ```
   Name: covoiturage-api
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Variables d'environnement**
   
   Ajouter dans l'interface Render :
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=<votre_mongodb_atlas_uri>
   JWT_SECRET=<secret_securise>
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=<autre_secret>
   JWT_REFRESH_EXPIRES_IN=30d
   FACEBOOK_APP_ID=<votre_app_id>
   FACEBOOK_APP_SECRET=<votre_secret>
   CLOUDINARY_CLOUD_NAME=<cloud_name>
   CLOUDINARY_API_KEY=<api_key>
   CLOUDINARY_API_SECRET=<api_secret>
   FRONTEND_URL=<url_de_votre_app>
   ```

5. **Déployer**
   - Cliquer sur "Create Web Service"
   - Render build et déploie automatiquement

6. **URL de l'API**
   ```
   https://covoiturage-api.onrender.com
   ```

## 🔷 Option 2: Déploiement sur Railway

Railway est moderne et offre un excellent DX.

### Étapes

1. **Créer un compte sur Railway**
   - Aller sur https://railway.app
   - Se connecter avec GitHub

2. **Nouveau projet**
   - Cliquer sur "New Project"
   - Sélectionner "Deploy from GitHub repo"
   - Choisir votre repository

3. **Configuration**
   
   Railway détecte automatiquement Node.js.
   
   Ajouter les variables d'environnement dans Settings → Variables

4. **Custom Start Command** (si nécessaire)
   ```
   npm run build && npm start
   ```

5. **Générer un domaine**
   - Aller dans Settings → Domains
   - Générer un domaine Railway ou ajouter un domaine custom

## 🟣 Option 3: Déploiement sur Heroku

### Étapes

1. **Installer Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Se connecter**
   ```bash
   heroku login
   ```

3. **Créer l'application**
   ```bash
   heroku create covoiturage-api
   ```

4. **Configurer les variables d'environnement**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=<mongodb_uri>
   heroku config:set JWT_SECRET=<secret>
   heroku config:set JWT_REFRESH_SECRET=<refresh_secret>
   heroku config:set FACEBOOK_APP_ID=<fb_id>
   heroku config:set FACEBOOK_APP_SECRET=<fb_secret>
   heroku config:set CLOUDINARY_CLOUD_NAME=<cloud_name>
   heroku config:set CLOUDINARY_API_KEY=<api_key>
   heroku config:set CLOUDINARY_API_SECRET=<api_secret>
   heroku config:set FRONTEND_URL=<frontend_url>
   ```

5. **Créer un Procfile** (à la racine de backend)
   ```
   web: npm start
   ```

6. **Déployer**
   ```bash
   git push heroku main
   ```

7. **Vérifier les logs**
   ```bash
   heroku logs --tail
   ```

## 🔵 Option 4: Déploiement sur un VPS (DigitalOcean, AWS EC2, etc.)

### Prérequis
- Un serveur Linux (Ubuntu recommandé)
- Accès SSH
- Nom de domaine (optionnel mais recommandé)

### Étapes

1. **Se connecter au serveur**
   ```bash
   ssh root@votre-ip
   ```

2. **Installer Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Installer MongoDB (optionnel si vous utilisez Atlas)**
   ```bash
   # Ou utiliser MongoDB Atlas (recommandé)
   ```

4. **Installer PM2**
   ```bash
   npm install -g pm2
   ```

5. **Cloner le projet**
   ```bash
   cd /var/www
   git clone <votre-repo>
   cd backend
   ```

6. **Installer les dépendances**
   ```bash
   npm install
   ```

7. **Créer le fichier .env**
   ```bash
   nano .env
   # Copier vos variables d'environnement
   ```

8. **Compiler TypeScript**
   ```bash
   npm run build
   ```

9. **Démarrer avec PM2**
   ```bash
   pm2 start dist/server.js --name covoiturage-api
   pm2 startup
   pm2 save
   ```

10. **Installer Nginx (optionnel mais recommandé)**
    ```bash
    sudo apt install nginx
    ```

11. **Configurer Nginx**
    ```bash
    sudo nano /etc/nginx/sites-available/covoiturage-api
    ```
    
    Contenu :
    ```nginx
    server {
        listen 80;
        server_name api.votre-domaine.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

12. **Activer la configuration**
    ```bash
    sudo ln -s /etc/nginx/sites-available/covoiturage-api /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

13. **Installer SSL avec Let's Encrypt**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d api.votre-domaine.com
    ```

## 📊 MongoDB Atlas Configuration

Pour tous les déploiements, MongoDB Atlas est recommandé.

### Étapes

1. **Créer un compte**
   - Aller sur https://www.mongodb.com/cloud/atlas
   - Créer un compte gratuit

2. **Créer un cluster**
   - Sélectionner le plan gratuit (M0)
   - Choisir une région proche de votre serveur

3. **Créer un utilisateur de base de données**
   - Database Access → Add New Database User
   - Créer un utilisateur avec mot de passe

4. **Whitelist IP**
   - Network Access → Add IP Address
   - Pour le développement : 0.0.0.0/0 (tous les IPs)
   - Pour la production : IP spécifique de votre serveur

5. **Obtenir la connection string**
   - Clusters → Connect → Connect your application
   - Copier la connection string
   - Remplacer `<password>` par votre mot de passe

   Exemple :
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/covoiturage?retryWrites=true&w=majority
   ```

## 🔍 Vérification du déploiement

### Test de santé

```bash
curl https://votre-api.com/health
```

Réponse attendue :
```json
{
  "success": true,
  "message": "API Covoiturage - Serveur opérationnel",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### Test d'une route

```bash
curl https://votre-api.com/api/trips/search?departureCity=Paris
```

## 🔧 Maintenance

### Mettre à jour le code

**Sur plateforme (Render, Railway, Heroku)**
- Simplement push sur GitHub
- Le déploiement se fait automatiquement

**Sur VPS**
```bash
cd /var/www/backend
git pull
npm install
npm run build
pm2 restart covoiturage-api
```

### Voir les logs

**Render/Railway/Heroku**
- Interface web

**VPS avec PM2**
```bash
pm2 logs covoiturage-api
pm2 monit
```

### Backup de la base de données

**MongoDB Atlas**
- Backups automatiques inclus dans le plan gratuit
- Restauration depuis l'interface

**MongoDB local**
```bash
mongodump --uri="mongodb://localhost:27017/covoiturage" --out=/backup
```

## ⚠️ Points importants

1. **Sécurité**
   - Toujours utiliser HTTPS en production
   - Ne jamais exposer les secrets dans le code
   - Utiliser des secrets différents en production

2. **Performance**
   - Activer la compression
   - Configurer un CDN pour les assets
   - Utiliser des index MongoDB appropriés

3. **Monitoring**
   - Configurer des alertes pour les erreurs
   - Monitorer l'utilisation des ressources
   - Logger les erreurs importantes

4. **Scalabilité**
   - Utiliser un load balancer si nécessaire
   - Considérer le sharding MongoDB pour beaucoup de données
   - Mettre en cache les requêtes fréquentes

## 📞 Support

En cas de problème :
1. Vérifier les logs
2. Vérifier les variables d'environnement
3. Tester localement d'abord
4. Vérifier la connexion à MongoDB

---

Bon déploiement ! 🚀

