# 🚀 Démarrage rapide - 5 minutes

Guide ultra-rapide pour démarrer le backend en 5 minutes.

## ⚡ Installation rapide

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp env.example .env

# 4. Éditer .env (au minimum, configurer MongoDB)
nano .env
# ou
code .env
```

## 🔧 Configuration minimale

Éditer `.env` et modifier au minimum :

```env
# MongoDB (OBLIGATOIRE)
MONGODB_URI=mongodb://localhost:27017/covoiturage
# Ou MongoDB Atlas :
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/covoiturage

# JWT Secrets (OBLIGATOIRE - utiliser des valeurs aléatoires)
JWT_SECRET=changez_moi_avec_une_chaine_aleatoire_securisee
JWT_REFRESH_SECRET=autre_chaine_aleatoire_securisee

# Le reste peut rester par défaut pour le développement
```

## 🎯 Démarrer le serveur

```bash
# Mode développement (avec rechargement automatique)
npm run dev
```

Le serveur démarre sur **http://localhost:3000**

## ✅ Vérifier que ça fonctionne

```bash
# Test de santé
curl http://localhost:3000/health
```

Vous devriez voir :
```json
{
  "success": true,
  "message": "API Covoiturage - Serveur opérationnel",
  "timestamp": "...",
  "environment": "development"
}
```

## 🧪 Tester l'API

### 1. Créer un compte

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Réponse : vous recevrez un `token` → **Copiez-le !**

### 2. Récupérer votre profil

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 3. Créer un trajet

```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "departure": {
      "city": "Paris",
      "latitude": 48.8566,
      "longitude": 2.3522
    },
    "destination": {
      "city": "Lyon",
      "latitude": 45.7640,
      "longitude": 4.8357
    },
    "departureTime": "2024-12-31T14:00:00Z",
    "price": 25,
    "availableSeats": 3
  }'
```

### 4. Rechercher des trajets

```bash
curl "http://localhost:3000/api/trips/search?departureCity=Paris&destinationCity=Lyon"
```

## 🗄️ MongoDB

### Option 1 : MongoDB Local (Recommandé pour débuter)

1. **Installer MongoDB** : https://www.mongodb.com/try/download/community
2. **Démarrer MongoDB** :
   ```bash
   # Windows
   net start MongoDB
   
   # Mac
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```
3. **Vérifier** :
   ```bash
   mongosh
   # Ou
   mongo
   ```

### Option 2 : MongoDB Atlas (Cloud - Gratuit)

1. Aller sur https://www.mongodb.com/cloud/atlas
2. Créer un compte gratuit
3. Créer un cluster (plan M0 gratuit)
4. Créer un utilisateur de base de données
5. Whitelist IP : `0.0.0.0/0` (pour le développement)
6. Copier la connection string dans `.env`

**Connection string Atlas :**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/covoiturage?retryWrites=true&w=majority
```

## 📋 Commandes utiles

```bash
# Démarrage développement
npm run dev

# Build pour production
npm run build

# Démarrer en production
npm start

# Linting
npm run lint
```

## 🐛 Problèmes courants

### Erreur : "Cannot connect to MongoDB"

**Solution** :
- Vérifier que MongoDB est démarré
- Vérifier l'URI dans `.env`
- Pour Atlas, vérifier que l'IP est whitelistée

### Erreur : "Port 3000 is already in use"

**Solution** :
```bash
# Changer le port dans .env
PORT=3001
```

### Erreur lors de `npm install`

**Solution** :
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 🔒 Sécurité importante

⚠️ **AVANT DE DÉPLOYER EN PRODUCTION** :

1. **Changer les secrets JWT** dans `.env`
2. **Utiliser MongoDB Atlas** (pas de MongoDB local)
3. **Configurer CORS** pour autoriser uniquement votre domaine
4. **Activer HTTPS**
5. **Ne JAMAIS commiter le fichier `.env`**

## 📚 Documentation complète

- **README.md** - Documentation complète
- **API.md** - Documentation détaillée de toutes les routes
- **DEPLOYMENT.md** - Guide de déploiement
- **INTEGRATION_FRONTEND.md** - Intégration avec React Native

## 🎯 Prochaines étapes

1. ✅ Backend fonctionnel
2. 📱 Connecter votre app React Native (voir `INTEGRATION_FRONTEND.md`)
3. 🎨 Personnaliser selon vos besoins
4. 🚀 Déployer en production (voir `DEPLOYMENT.md`)

---

**Vous êtes prêt ! Le backend est opérationnel.** 🎉

Pour toute question, consultez les autres fichiers de documentation ou créez une issue.

