# 🚀 Démarrage Rapide Docker - 2 Minutes

## ⚡ Étape 1 : Créer le fichier .env (30 secondes)

Créez le fichier `backend/.env` avec ce contenu minimum :

```env
# JWT (OBLIGATOIRE - Changez cette valeur !)
JWT_SECRET=mon_secret_super_securise_changez_moi_12345

# MongoDB (Auto-configuré)
MONGO_USERNAME=admin
MONGO_PASSWORD=password123
```

## 🐳 Étape 2 : Démarrer (30 secondes)

```bash
cd backend
docker-compose up -d
```

## ✅ Étape 3 : Vérifier (30 secondes)

```bash
# Voir les logs
docker-compose logs -f backend

# Tester l'API
curl http://localhost:3000/health
```

---

## 🎯 C'est Tout !

Votre backend tourne maintenant sur **http://localhost:3000**

### Commandes Utiles

```bash
# Arrêter
docker-compose down

# Redémarrer
docker-compose restart

# Voir les logs
docker-compose logs -f

# Rebuild après modification
docker-compose up -d --build
```

---

## 📱 Configuration App Mobile

Dans votre app React Native, utilisez :
- **Localhost** : `http://localhost:3000`
- **Réseau local** : `http://192.168.x.x:3000` (remplacez par votre IP)
- **Production** : `https://votre-domaine.com`

---

Pour plus de détails, consultez **DOCKER_DEPLOY.md** 📚


