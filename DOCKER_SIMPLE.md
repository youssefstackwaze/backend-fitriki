# 🐳 Docker Simple - 3 Étapes

## ⚡ Démarrage Rapide

### Étape 1 : Créer le fichier .env

Créez `backend/.env` avec :

```env
MONGODB_URI=mongodb://localhost:27017/covoiturage
JWT_SECRET=mon_secret_changez_moi
```

### Étape 2 : Construire et Lancer

```bash
cd backend

# Build
docker build -t covoiturage-backend .

# Run
docker run -d -p 3000:3000 \
  --env-file .env \
  --name covoiturage-api \
  covoiturage-backend
```

### Étape 3 : Vérifier

```bash
curl http://localhost:3000/health
```

---

## 📝 Commandes Utiles

```bash
# Voir les logs
docker logs -f covoiturage-api

# Arrêter
docker stop covoiturage-api

# Redémarrer
docker restart covoiturage-api

# Supprimer
docker rm -f covoiturage-api

# Rebuild
docker build -t covoiturage-backend . && \
docker rm -f covoiturage-api && \
docker run -d -p 3000:3000 --env-file .env --name covoiturage-api covoiturage-backend
```

---

## 🚀 Avec Docker Compose (Plus Facile)

```bash
cd backend

# Créer .env (voir Étape 1)

# Démarrer
docker-compose up -d

# Logs
docker-compose logs -f

# Arrêter
docker-compose down
```

---

## 🎯 C'est Tout !

Votre backend tourne sur **http://localhost:3000** 🚀


