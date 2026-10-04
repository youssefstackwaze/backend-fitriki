# 🐳 Guide Docker - Backend Covoiturage

## 📋 Prérequis

- Docker Desktop installé : https://www.docker.com/products/docker-desktop
- Docker Compose (inclus avec Docker Desktop)
- Fichier `.env` configuré avec vos vraies valeurs

---

## 🚀 Démarrage Rapide

### 1. Préparer l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos vraies valeurs
nano .env  # ou utilisez votre éditeur préféré
```

### 2. Build l'image Docker

```bash
# Build l'image
docker build -t covoiturage-backend:latest .

# Vérifier que l'image est créée
docker images | grep covoiturage
```

### 3. Lancer avec Docker Compose

```bash
# Lancer en arrière-plan
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Vérifier le statut
docker-compose ps
```

---

## 🛠️ Commandes Utiles

### Build et Run

```bash
# Build sans cache
docker build --no-cache -t covoiturage-backend:latest .

# Run l'image directement (sans compose)
docker run -d \
  --name covoiturage-backend \
  -p 3000:3000 \
  --env-file .env \
  covoiturage-backend:latest

# Arrêter le conteneur
docker stop covoiturage-backend

# Supprimer le conteneur
docker rm covoiturage-backend
```

### Avec Docker Compose

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Reconstruire et relancer
docker-compose up -d --build

# Voir les logs en temps réel
docker-compose logs -f

# Voir les logs des 100 dernières lignes
docker-compose logs --tail=100 backend

# Entrer dans le conteneur (debug)
docker-compose exec backend sh
```

### Maintenance

```bash
# Nettoyer les images inutilisées
docker image prune -a

# Nettoyer tout (conteneurs, images, volumes, réseaux)
docker system prune -a --volumes

# Voir l'utilisation des ressources
docker stats
```

---

## 🔍 Health Check

Le conteneur inclut un health check automatique :

```bash
# Vérifier la santé du conteneur
docker inspect --format='{{.State.Health.Status}}' covoiturage-backend

# Tester manuellement le endpoint health
curl http://localhost:3000/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "uptime": 12345
}
```

---

## 📊 Monitoring

### Logs

```bash
# Logs en temps réel
docker-compose logs -f backend

# Logs avec horodatage
docker-compose logs -f -t backend

# Filtrer les logs
docker-compose logs backend | grep "Error"
```

### Ressources

```bash
# Utilisation CPU/RAM en temps réel
docker stats covoiturage-backend

# Informations détaillées
docker inspect covoiturage-backend
```

---

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

✅ **Image multi-stage** : Build séparé de la production  
✅ **Utilisateur non-root** : Le conteneur ne run pas en tant que root  
✅ **Image Alpine** : Image de base minimale et sécurisée  
✅ **Healthcheck** : Surveillance automatique de l'état  
✅ **Secrets** : Variables d'environnement via `.env`  
✅ **.dockerignore** : Fichiers sensibles exclus  

### Variables d'Environnement Sensibles

⚠️ **IMPORTANT** : Ne JAMAIS commit le fichier `.env` !

Ajoutez dans `.gitignore` :
```
.env
.env.local
.env.production
```

---

## 🚢 Déploiement Production

### 1. Sur un serveur VPS (DigitalOcean, AWS, etc.)

```bash
# Sur le serveur
git clone votre-repo
cd backend

# Configurer .env avec les valeurs production
nano .env

# Lancer
docker-compose up -d

# Configurer nginx comme reverse proxy (optionnel)
```

### 2. Docker Hub

```bash
# Se connecter
docker login

# Tagger l'image
docker tag covoiturage-backend:latest votre-username/covoiturage-backend:latest

# Pusher sur Docker Hub
docker push votre-username/covoiturage-backend:latest

# Sur le serveur de production
docker pull votre-username/covoiturage-backend:latest
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  votre-username/covoiturage-backend:latest
```

### 3. Avec CI/CD (GitHub Actions exemple)

Créez `.github/workflows/docker.yml` :

```yaml
name: Docker Build & Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t covoiturage-backend .
      
      - name: Push to Docker Hub
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push votre-username/covoiturage-backend:latest
```

---

## 🐛 Dépannage

### Le conteneur ne démarre pas

```bash
# Voir les logs d'erreur
docker-compose logs backend

# Vérifier les variables d'environnement
docker-compose exec backend env

# Vérifier que le port n'est pas déjà utilisé
netstat -an | grep 3000
```

### Problème de connexion MongoDB

```bash
# Vérifier que MONGODB_URI est correct dans .env
cat .env | grep MONGODB_URI

# Tester la connexion depuis le conteneur
docker-compose exec backend sh
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('✅ OK')).catch(e => console.log('❌', e))"
```

### L'API ne répond pas

```bash
# Vérifier que le conteneur est en cours d'exécution
docker ps

# Vérifier le health check
docker inspect --format='{{.State.Health.Status}}' covoiturage-backend

# Tester le endpoint directement
curl -v http://localhost:3000/health
```

---

## 📦 Structure de l'Image

```
Image finale (~150MB)
├── node_modules (prod seulement)
├── dist (code compilé)
├── package.json
└── dumb-init (PID 1)
```

**Avantages** :
- ⚡ Petit: ~150MB (vs ~1GB sans multi-stage)
- 🔒 Sécurisé: utilisateur non-root
- 🚀 Rapide: code pré-compilé
- 💪 Robuste: gestion propre des signaux

---

## 📝 Checklist de Production

Avant de déployer en production :

- [ ] Fichier `.env` avec de vraies valeurs
- [ ] Secrets JWT forts (générés avec `openssl rand -base64 32`)
- [ ] MongoDB accessible depuis le serveur
- [ ] Cloudinary configuré
- [ ] Email SMTP configuré
- [ ] CORS configuré (`FRONTEND_URL`)
- [ ] Firewall configuré (port 3000 ou via reverse proxy)
- [ ] Certificat SSL/TLS (via nginx + Let's Encrypt)
- [ ] Monitoring configuré (logs, alertes)
- [ ] Backups MongoDB automatiques

---

## 🎯 Commandes Essentielles Résumées

```bash
# Development local (sans Docker)
npm run dev

# Build image Docker
docker build -t covoiturage-backend .

# Run avec Docker Compose
docker-compose up -d

# Voir logs
docker-compose logs -f

# Arrêter
docker-compose down

# Rebuild
docker-compose up -d --build

# Health check
curl http://localhost:3000/health
```

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs : `docker-compose logs -f`
2. Vérifiez le health check : `docker inspect covoiturage-backend`
3. Vérifiez les variables d'environnement : `docker-compose exec backend env`
4. Testez la connexion MongoDB
5. Vérifiez que les ports ne sont pas déjà utilisés

---

**Votre backend est maintenant prêt à être containerisé et déployé ! 🚀🐳**

