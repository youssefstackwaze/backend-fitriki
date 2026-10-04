# 🐳 Guide Docker - Backend Covoiturage

## 📦 Fichiers Docker Fournis

1. **`Dockerfile`** - Image optimisée pour le backend Node.js
2. **`docker-compose.yml`** - Configuration complète avec MongoDB

---

## 🚀 Utilisation

### Option 1 : Docker seul

```bash
# Construire l'image
docker build -t covoiturage-backend:latest .

# Lancer le conteneur
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI="votre_uri_mongodb" \
  -e JWT_SECRET="votre_secret" \
  --name covoiturage-backend \
  covoiturage-backend:latest
```

### Option 2 : Docker Compose (Recommandé)

```bash
# Créer un fichier .env avec vos variables
cp .env.example .env

# Démarrer tous les services (backend + MongoDB)
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter les services
docker-compose down
```

---

## 📋 Variables d'Environnement Nécessaires

Créez un fichier `.env` à la racine du dossier `backend` :

```env
# Port
PORT=3000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb://admin:password@mongodb:27017/covoiturage?authSource=admin

# JWT
JWT_SECRET=votre_secret_super_securise
JWT_EXPIRE=7d

# MongoDB Docker
MONGO_USERNAME=admin
MONGO_PASSWORD=password
```

---

## ✅ Vérification

### Vérifier que le backend fonctionne

```bash
# Avec docker-compose
curl http://localhost:3000/health

# Voir les logs
docker-compose logs backend
```

### Vérifier MongoDB

```bash
# Se connecter à MongoDB
docker exec -it covoiturage-mongodb mongosh -u admin -p password
```

---

## 🔧 Commandes Utiles

```bash
# Rebuild après modifications
docker-compose up -d --build

# Voir les conteneurs actifs
docker-compose ps

# Redémarrer un service
docker-compose restart backend

# Supprimer tout (conteneurs + volumes)
docker-compose down -v

# Voir les logs en temps réel
docker-compose logs -f
```

---

## 🎯 Caractéristiques du Dockerfile

✅ **Multi-stage build** - Image finale légère  
✅ **Utilisateur non-root** - Sécurité renforcée  
✅ **Healthcheck** - Vérification automatique  
✅ **Production-ready** - Optimisé pour la prod  
✅ **Cache optimisé** - Build rapide  

---

## 🆘 Dépannage

### Erreur "503 Service Unavailable"

Docker Hub est temporairement indisponible. Solutions :

1. **Attendez 10-30 minutes** et réessayez
2. **Utilisez npm** en attendant :
   ```bash
   npm install
   npm run dev
   ```

### Le conteneur ne démarre pas

```bash
# Voir les logs
docker-compose logs backend

# Vérifier les variables d'environnement
docker-compose config
```

### Impossible de se connecter à MongoDB

Vérifiez que :
- MongoDB est démarré : `docker-compose ps`
- L'URI est correcte dans le `.env`
- Le port 27017 n'est pas utilisé

---

## 🌐 Accès

Une fois démarré :

- **Backend** : http://localhost:3000
- **API Docs** : http://localhost:3000/api
- **Health Check** : http://localhost:3000/health

---

## 📝 Notes

- Le Dockerfile utilise **Node.js 20 Alpine** (image légère)
- **Production-ready** avec optimisations de sécurité
- Compatible avec les services cloud (Render, Railway, etc.)

---

Fait avec ❤️ pour votre projet de covoiturage ! 🚗

