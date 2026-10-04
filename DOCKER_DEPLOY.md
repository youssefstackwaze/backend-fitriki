# 🐳 Guide de Déploiement Docker - Backend Covoiturage

## 📋 Table des Matières
1. [Prérequis](#prérequis)
2. [Installation Rapide](#installation-rapide)
3. [Configuration](#configuration)
4. [Commandes Utiles](#commandes-utiles)
5. [Dépannage](#dépannage)

---

## 🎯 Prérequis

- **Docker** installé (version 20.10+)
- **Docker Compose** installé (version 2.0+)
- **Git** (optionnel)

### Vérifier l'installation :
```bash
docker --version
docker-compose --version
```

---

## 🚀 Installation Rapide

### Étape 1 : Préparer l'environnement

```bash
cd backend

# Copier le fichier d'exemple
cp .env.docker.example .env

# Éditer avec vos valeurs
nano .env  # ou notepad .env sur Windows
```

### Étape 2 : Configurer les variables (IMPORTANT)

Modifiez au minimum ces valeurs dans `.env` :

```env
# JWT - CHANGEZ OBLIGATOIREMENT
JWT_SECRET=mon_secret_super_securise_ultra_long_12345

# MongoDB - CHANGEZ EN PRODUCTION
MONGO_PASSWORD=mon_mot_de_passe_securise
```

### Étape 3 : Démarrer tous les services

```bash
docker-compose up -d
```

✅ **C'est tout !** Le backend et MongoDB sont maintenant lancés.

### Étape 4 : Vérifier que tout fonctionne

```bash
# Voir les logs
docker-compose logs -f backend

# Vérifier le status
docker-compose ps

# Tester l'API
curl http://localhost:3000/health
```

---

## ⚙️ Configuration Détaillée

### Structure des fichiers Docker

```
backend/
├── Dockerfile              # Image Docker optimisée
├── docker-compose.yml      # Orchestration des services
├── .dockerignore          # Fichiers à ignorer
├── .env                   # Vos variables (à créer)
└── .env.docker.example    # Template des variables
```

### Variables d'environnement importantes

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `JWT_SECRET` | Secret pour les tokens JWT | ✅ Oui | `mon_secret_12345` |
| `MONGODB_URI` | URI de connexion MongoDB | ✅ Oui | Auto-configuré |
| `MONGO_PASSWORD` | Mot de passe MongoDB | ✅ Oui | `password123` |
| `EMAIL_HOST` | Serveur SMTP | ⚠️ Optionnel | `smtp.gmail.com` |
| `CLOUDINARY_*` | Config upload images | ⚠️ Optionnel | - |
| `TWILIO_*` | Config SMS | ⚠️ Optionnel | - |

---

## 📦 Commandes Docker Utiles

### Gestion des services

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Redémarrer un service
docker-compose restart backend

# Voir les logs
docker-compose logs -f backend

# Voir tous les logs
docker-compose logs -f

# Rebuild après modification du code
docker-compose up -d --build
```

### Gestion des conteneurs

```bash
# Voir les conteneurs actifs
docker ps

# Voir tous les conteneurs (même arrêtés)
docker ps -a

# Accéder au shell d'un conteneur
docker exec -it covoiturage-backend sh

# Accéder à MongoDB
docker exec -it covoiturage-mongodb mongosh -u admin -p password123
```

### Gestion des images

```bash
# Voir les images
docker images

# Supprimer une image
docker rmi covoiturage-backend

# Rebuild l'image
docker-compose build --no-cache
```

### Nettoyage

```bash
# Arrêter et supprimer les conteneurs
docker-compose down

# Supprimer aussi les volumes (ATTENTION: perte de données)
docker-compose down -v

# Nettoyer Docker complètement
docker system prune -a
```

---

## 🔍 Monitoring

### Voir les logs en temps réel

```bash
# Backend uniquement
docker-compose logs -f backend

# MongoDB uniquement
docker-compose logs -f mongodb

# Tout
docker-compose logs -f
```

### Vérifier la santé des services

```bash
# Status des services
docker-compose ps

# Vérifier le healthcheck
docker inspect covoiturage-backend | grep -A 10 Health
```

### Statistiques d'utilisation

```bash
# CPU, RAM, réseau
docker stats covoiturage-backend
```

---

## 🧪 Tests

### Tester l'API

```bash
# Health check
curl http://localhost:3000/health

# API principale
curl http://localhost:3000/api

# Avec format JSON
curl -s http://localhost:3000/health | jq
```

### Tester MongoDB

```bash
# Se connecter à MongoDB
docker exec -it covoiturage-mongodb mongosh -u admin -p password123

# Dans le shell MongoDB:
> use covoiturage
> db.trips.find().limit(5)
> exit
```

---

## 🆘 Dépannage

### Problème : Le conteneur ne démarre pas

**Vérifier les logs :**
```bash
docker-compose logs backend
```

**Solutions communes :**
- Vérifier que le fichier `.env` existe et contient `JWT_SECRET`
- Vérifier que le port 3000 n'est pas déjà utilisé
- Vérifier que MongoDB démarre correctement

### Problème : Erreur de connexion MongoDB

**Vérifier MongoDB :**
```bash
docker-compose logs mongodb
docker-compose ps mongodb
```

**Solutions :**
- Attendre 10-20 secondes que MongoDB démarre complètement
- Vérifier le mot de passe dans `.env`
- Redémarrer : `docker-compose restart mongodb`

### Problème : Port 3000 déjà utilisé

**Solution 1 : Changer le port**
```bash
# Dans .env
PORT=3001

# Ou directement
docker-compose up -d -e PORT=3001
```

**Solution 2 : Libérer le port**
```bash
# Voir qui utilise le port
netstat -ano | findstr :3000    # Windows
lsof -i :3000                    # Linux/Mac

# Arrêter le processus
```

### Problème : Image ne se build pas

**Nettoyer et rebuild :**
```bash
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

### Problème : Pas de connexion à l'API depuis le mobile

**Vérifier :**
- Le backend tourne : `docker-compose ps`
- Le port est accessible : `curl http://localhost:3000/health`
- L'IP du serveur est correcte dans l'app mobile
- Le firewall autorise le port 3000

---

## 📊 Production Best Practices

### Sécurité

✅ **IMPORTANT pour la production :**

1. **Changez TOUS les secrets** dans `.env`
2. **Utilisez des mots de passe forts**
3. **Limitez CORS_ORIGIN** à votre domaine
4. **Activez HTTPS** (avec reverse proxy)
5. **Sauvegardez MongoDB** régulièrement

### Sauvegarde MongoDB

```bash
# Créer une sauvegarde
docker exec covoiturage-mongodb mongodump --username admin --password password123 --authenticationDatabase admin --out /backup

# Copier la sauvegarde
docker cp covoiturage-mongodb:/backup ./backup-$(date +%Y%m%d)
```

### Mise à jour

```bash
# 1. Sauvegarder la base de données
docker exec covoiturage-mongodb mongodump --out /backup

# 2. Arrêter les services
docker-compose down

# 3. Mettre à jour le code
git pull

# 4. Rebuild et redémarrer
docker-compose up -d --build
```

---

## 🌐 Déploiement Cloud

### Sur VPS (DigitalOcean, Linode, etc.)

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Cloner le repo
git clone votre-repo.git
cd projet-covoiturage/backend

# Configurer et lancer
cp .env.docker.example .env
nano .env
docker-compose up -d
```

### Avec Nginx (reverse proxy)

```nginx
server {
    listen 80;
    server_name api.votredomaine.com;

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

---

## 📈 Monitoring Production

### Logs persistants

```bash
# Créer un volume pour les logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Alertes

Utilisez des outils comme :
- **Portainer** (interface web pour Docker)
- **Watchtower** (mises à jour automatiques)
- **Prometheus + Grafana** (monitoring avancé)

---

## ✅ Checklist de Déploiement

Avant de déployer en production :

- [ ] `.env` configuré avec des valeurs sécurisées
- [ ] `JWT_SECRET` changé et fort (32+ caractères)
- [ ] `MONGO_PASSWORD` changé et fort
- [ ] Ports exposés uniquement si nécessaire
- [ ] CORS limité au domaine de l'app
- [ ] Healthcheck fonctionne
- [ ] Sauvegarde MongoDB configurée
- [ ] SSL/HTTPS activé (via reverse proxy)
- [ ] Logs configurés et surveillés
- [ ] Ressources (CPU/RAM) suffisantes

---

## 📞 Support

Pour plus d'aide :
- Consultez les logs : `docker-compose logs -f`
- Vérifiez la documentation Docker
- Consultez le README.md principal

---

**Fait avec ❤️ pour votre projet de covoiturage !** 🚗💨


