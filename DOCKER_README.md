# 🐳 Configuration Docker Complete - Backend Covoiturage

## 📦 Fichiers Créés

Voici tous les fichiers Docker que j'ai créés pour vous :

| Fichier | Description |
|---------|-------------|
| `Dockerfile` | Image Docker optimisée multi-stage avec sécurité |
| `docker-compose.yml` | Orchestration Backend + MongoDB |
| `.dockerignore` | Fichiers à exclure du build |
| `env.docker.template` | Template des variables d'environnement |
| `start-docker.sh` | Script de démarrage automatique (Linux/Mac) |
| `start-docker.bat` | Script de démarrage automatique (Windows) |
| `DOCKER_QUICKSTART.md` | Guide démarrage rapide (2 min) |
| `DOCKER_DEPLOY.md` | Guide complet et professionnel |

---

## 🚀 Démarrage Ultra-Rapide (3 Commandes)

### Option 1 : Avec Script Automatique

**Linux/Mac :**
```bash
chmod +x start-docker.sh
./start-docker.sh
```

**Windows :**
```bash
start-docker.bat
```

### Option 2 : Manuel (3 étapes)

```bash
# 1. Créer le fichier .env
cp env.docker.template .env
# Éditez .env et changez JWT_SECRET !

# 2. Démarrer
docker-compose up -d

# 3. Vérifier
curl http://localhost:3000/health
```

---

## ✨ Caractéristiques

### Dockerfile
✅ **Multi-stage build** - Image finale légère (~150 MB)  
✅ **Sécurité** - Utilisateur non-root  
✅ **Healthcheck** - Monitoring automatique  
✅ **Production-ready** - Optimisé pour la prod  
✅ **Cache optimisé** - Build rapide  

### Docker Compose
✅ **MongoDB inclus** - Prêt à l'emploi  
✅ **Variables d'environnement** - Configuration facile  
✅ **Réseaux isolés** - Sécurité renforcée  
✅ **Volumes persistants** - Données sauvegardées  
✅ **Healthchecks** - Dépendances gérées  

---

## 📋 Configuration Minimale Requise

Dans votre fichier `.env`, vous devez avoir **au minimum** :

```env
JWT_SECRET=changez_moi_secret_super_long
MONGO_PASSWORD=mon_mot_de_passe
```

Le reste est auto-configuré ! 🎉

---

## 🎯 Services Démarrés

Après `docker-compose up -d`, vous aurez :

1. **Backend API** → http://localhost:3000
2. **MongoDB** → localhost:27017
3. **Healthchecks** → Vérification automatique

---

## 📝 Commandes Essentielles

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Logs
docker-compose logs -f backend

# Redémarrer après modification
docker-compose up -d --build

# Status
docker-compose ps

# Accéder au shell backend
docker exec -it covoiturage-backend sh

# Accéder à MongoDB
docker exec -it covoiturage-mongodb mongosh -u admin -p password123
```

---

## 🧪 Tests

```bash
# Health check
curl http://localhost:3000/health

# API
curl http://localhost:3000/api

# Depuis votre app mobile
# Utilisez l'IP de votre machine: http://192.168.x.x:3000
```

---

## 📚 Documentation

- **Démarrage rapide** → `DOCKER_QUICKSTART.md` (2 min)
- **Guide complet** → `DOCKER_DEPLOY.md` (tout ce qu'il faut savoir)
- **Ce fichier** → Vue d'ensemble

---

## 🔒 Sécurité Production

**IMPORTANT avant de déployer en production :**

1. ✅ Changez `JWT_SECRET` (minimum 32 caractères)
2. ✅ Changez `MONGO_PASSWORD`
3. ✅ Limitez `CORS_ORIGIN` à votre domaine
4. ✅ Utilisez HTTPS (reverse proxy Nginx/Traefik)
5. ✅ Configurez des sauvegardes MongoDB
6. ✅ Activez le monitoring

---

## 🌐 Déploiement Cloud

### VPS (DigitalOcean, Linode, AWS EC2, etc.)

```bash
# 1. Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Cloner le projet
git clone votre-repo.git
cd projet-covoiturage/backend

# 3. Configurer
cp env.docker.template .env
nano .env  # Éditez vos valeurs

# 4. Démarrer
docker-compose up -d
```

### Avec Nom de Domaine

Ajoutez un reverse proxy Nginx :

```nginx
server {
    listen 80;
    server_name api.votredomaine.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Puis installez Certbot pour SSL :
```bash
sudo certbot --nginx -d api.votredomaine.com
```

---

## 🆘 Dépannage Rapide

### Le conteneur ne démarre pas
```bash
docker-compose logs backend
```

### Port 3000 déjà utilisé
Changez le port dans `.env` : `PORT=3001`

### MongoDB ne démarre pas
```bash
docker-compose logs mongodb
docker-compose restart mongodb
```

### Rebuild complet
```bash
docker-compose down
docker system prune -f
docker-compose up -d --build
```

---

## 💡 Tips

1. **Développement** → Utilisez `npm run dev` (plus rapide)
2. **Test** → Docker pour simuler la production
3. **Production** → Docker avec monitoring

---

## 📊 Monitoring (Production)

Installez Portainer pour une interface web :

```bash
docker volume create portainer_data
docker run -d -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

Accédez à http://localhost:9000

---

## ✅ Checklist de Déploiement

Avant de mettre en production :

- [ ] `.env` configuré avec valeurs sécurisées
- [ ] `JWT_SECRET` changé (32+ caractères)
- [ ] `MONGO_PASSWORD` changé
- [ ] Tests réalisés localement
- [ ] Healthcheck fonctionne
- [ ] CORS configuré correctement
- [ ] SSL/HTTPS activé
- [ ] Sauvegarde MongoDB planifiée
- [ ] Monitoring configuré

---

## 🎉 C'est Tout !

Vous avez maintenant une **configuration Docker professionnelle** avec :

- ✅ Build optimisé
- ✅ Sécurité renforcée
- ✅ MongoDB inclus
- ✅ Scripts automatiques
- ✅ Documentation complète
- ✅ Production-ready

**Bon déploiement ! 🚀**

---

## 📞 Besoin d'Aide ?

1. Consultez `DOCKER_DEPLOY.md` pour les détails
2. Vérifiez les logs : `docker-compose logs -f`
3. Vérifiez le status : `docker-compose ps`

---

**Fait avec ❤️ pour votre projet de covoiturage** 🚗


