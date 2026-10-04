# 📋 Résumé rapide - Déploiement OVH

## ⚡ Version ultra-rapide (pour les impatients)

### Sur votre serveur OVH :

```bash
# 1. Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Cloner le projet
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/votre-repo/projet-covoiturage.git
cd projet-covoiturage/backend

# 3. Configurer .env
cp env.example .env
nano .env  # Ajustez les variables

# 4. Installer et démarrer
npm install
npm run build
sudo npm install -g pm2
pm2 start dist/server.js --name covoiturage-api
pm2 startup
pm2 save

# 5. Installer Nginx
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/covoiturage-api
```

Copiez cette config Nginx :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# 6. Activer Nginx
sudo ln -s /etc/nginx/sites-available/covoiturage-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 7. Firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# 8. SSL (si domaine)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d votre-domaine.com
```

## ✅ Tester

```bash
curl http://localhost:3000/health
curl http://votre-domaine.com/health
```

## 🔄 Mettre à jour

```bash
cd ~/apps/projet-covoiturage/backend
git pull
npm install
npm run build
pm2 restart covoiturage-api
```

## 📊 Commandes utiles

```bash
pm2 status              # Statut
pm2 logs                # Logs en temps réel
pm2 restart covoiturage-api  # Redémarrer
pm2 monit               # Monitoring
```

## 🆘 En cas de problème

```bash
# Vérifier les logs
pm2 logs covoiturage-api

# Vérifier que l'app tourne
pm2 status

# Vérifier Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Redémarrer tout
pm2 restart covoiturage-api
sudo systemctl restart nginx
```

## 📱 Mise à jour de l'app mobile

Dans `covoiturage-app/config/api.ts` :

```typescript
export const API_URL = 'https://votre-domaine.com/api';
```

---

**Pour plus de détails**, consultez le fichier complet : `DEPLOYMENT_OVH.md`

