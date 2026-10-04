# 🚗 Backend API - Application de Covoiturage

API REST complète pour l'application mobile de covoiturage développée avec Express, TypeScript et MongoDB.

## 🚀 Déploiement sur OVH

**NOUVEAU !** Des guides complets pour déployer sur OVH sont maintenant disponibles :

- 📑 **[INDEX_DEPLOIEMENT.md](./INDEX_DEPLOIEMENT.md)** - COMMENCEZ ICI
- 📘 **[DEPLOYMENT_OVH.md](./DEPLOYMENT_OVH.md)** - Guide complet pas à pas
- ✅ **[CHECKLIST_DEPLOIEMENT_OVH.md](./CHECKLIST_DEPLOIEMENT_OVH.md)** - Checklist à suivre
- 🔧 **[COMMANDES_OVH.md](./COMMANDES_OVH.md)** - Aide-mémoire des commandes
- ⚡ **[deploy-ovh.sh](./deploy-ovh.sh)** - Script d'automatisation

**Déploiement rapide :** Suivez [DEPLOYMENT_OVH.md](./DEPLOYMENT_OVH.md) (~45 minutes)

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies utilisées](#-technologies-utilisées)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Structure du projet](#-structure-du-projet)
- [Documentation API](#-documentation-api)
- [Modèles de données](#-modèles-de-données)
- [Sécurité](#-sécurité)
- [Déploiement](#-déploiement)

## ✨ Fonctionnalités

### Authentification
- ✅ Inscription et connexion par email/mot de passe
- ✅ Authentification Facebook OAuth
- ✅ Tokens JWT (Access & Refresh)
- ✅ Protection des routes avec middleware d'authentification

### Gestion des utilisateurs
- ✅ Profils utilisateurs complets
- ✅ Upload de photos de profil (Cloudinary)
- ✅ Système de notation et avis
- ✅ Historique des trajets

### Gestion des trajets
- ✅ Création et modification de trajets
- ✅ Recherche avancée (ville, date, prix, places)
- ✅ Recherche géospatiale par proximité
- ✅ Annulation de trajets

### Système de réservations
- ✅ Réservation de places
- ✅ Confirmation/Annulation par le conducteur
- ✅ Gestion automatique des places disponibles
- ✅ Historique des réservations

### Système d'avis
- ✅ Notation des conducteurs et passagers
- ✅ Commentaires et feedbacks
- ✅ Calcul automatique de la note moyenne

## 🛠 Technologies utilisées

- **Runtime**: Node.js
- **Framework**: Express.js
- **Langage**: TypeScript
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Upload**: Multer + Cloudinary
- **Sécurité**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan

## 📦 Prérequis

- Node.js >= 16.x
- npm ou yarn
- MongoDB (local ou Atlas)
- Compte Cloudinary (pour l'upload d'images)
- Compte Facebook Developer (pour OAuth)

## 🚀 Installation

1. **Cloner le repository et naviguer vers le dossier backend**

```bash
cd backend
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Copier le fichier `env.example` vers `.env` :

```bash
cp env.example .env
```

Puis éditer le fichier `.env` avec vos propres valeurs.

## ⚙️ Configuration

### Variables d'environnement requises

Créer un fichier `.env` à la racine du dossier backend :

```env
# Environnement
NODE_ENV=development
PORT=3000

# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/covoiturage
# Ou pour MongoDB Atlas :
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/covoiturage

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=votre_secret_refresh_token
JWT_REFRESH_EXPIRES_IN=30d

# Facebook OAuth
FACEBOOK_APP_ID=votre_app_id_facebook
FACEBOOK_APP_SECRET=votre_app_secret_facebook

# Cloudinary (pour upload d'images)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Frontend URL (pour CORS)
FRONTEND_URL=http://localhost:8081

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Configuration MongoDB

**Option 1: MongoDB Local**

1. Installer MongoDB : https://www.mongodb.com/try/download/community
2. Démarrer MongoDB : `mongod`
3. Utiliser l'URI : `mongodb://localhost:27017/covoiturage`

**Option 2: MongoDB Atlas (Cloud)**

1. Créer un compte sur https://www.mongodb.com/cloud/atlas
2. Créer un cluster gratuit
3. Créer un utilisateur de base de données
4. Whitelist votre IP
5. Copier la connection string dans `MONGODB_URI`

### Configuration Cloudinary

1. Créer un compte sur https://cloudinary.com
2. Accéder au Dashboard
3. Copier Cloud Name, API Key et API Secret dans le `.env`

## 🎯 Démarrage

### Mode développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### Mode production

```bash
# Compiler TypeScript
npm run build

# Démarrer le serveur
npm start
```

### Vérifier que le serveur fonctionne

```bash
curl http://localhost:3000/health
```

Réponse attendue :
```json
{
  "success": true,
  "message": "API Covoiturage - Serveur opérationnel",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## 📁 Structure du projet

```
backend/
├── src/
│   ├── config/           # Configurations (DB, Cloudinary)
│   │   ├── database.ts
│   │   └── cloudinary.ts
│   ├── controllers/      # Logique métier
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── trip.controller.ts
│   │   └── booking.controller.ts
│   ├── middlewares/      # Middlewares Express
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── upload.middleware.ts
│   ├── models/           # Modèles Mongoose
│   │   ├── User.ts
│   │   ├── Trip.ts
│   │   ├── Booking.ts
│   │   └── Review.ts
│   ├── routes/           # Routes API
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── trip.routes.ts
│   │   └── booking.routes.ts
│   ├── types/            # Types TypeScript
│   │   └── index.ts
│   ├── utils/            # Utilitaires
│   │   ├── ApiError.ts
│   │   ├── asyncHandler.ts
│   │   └── jwt.ts
│   ├── validators/       # Validateurs express-validator
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   ├── trip.validator.ts
│   │   └── booking.validator.ts
│   ├── app.ts           # Configuration Express
│   └── server.ts        # Point d'entrée
├── dist/                # Fichiers compilés (généré)
├── .env                 # Variables d'environnement (à créer)
├── env.example          # Exemple de variables d'environnement
├── .gitignore
├── nodemon.json         # Configuration Nodemon
├── package.json
├── tsconfig.json        # Configuration TypeScript
└── README.md
```

## 📚 Documentation API

### Base URL

```
http://localhost:3000/api
```

### Authentification

#### Inscription

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "motdepasse123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phoneNumber": "0612345678"
}
```

#### Connexion

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

#### Authentification Facebook

```http
POST /api/auth/facebook
Content-Type: application/json

{
  "facebookToken": "EAAxxxxx...",
  "facebookId": "123456789"
}
```

#### Récupérer le profil

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Trajets

#### Créer un trajet

```http
POST /api/trips
Authorization: Bearer <token>
Content-Type: application/json

{
  "departure": {
    "city": "Paris",
    "address": "Gare de Lyon",
    "latitude": 48.8447,
    "longitude": 2.3739
  },
  "destination": {
    "city": "Lyon",
    "address": "Part-Dieu",
    "latitude": 45.7603,
    "longitude": 4.8590
  },
  "departureTime": "2024-06-15T14:00:00Z",
  "price": 25,
  "availableSeats": 3,
  "description": "Trajet tranquille, pauses possibles"
}
```

#### Rechercher des trajets

```http
GET /api/trips/search?departureCity=Paris&destinationCity=Lyon&date=2024-06-15&minSeats=2
```

#### Récupérer un trajet

```http
GET /api/trips/:id
```

#### Mes trajets

```http
GET /api/trips/my/trips
Authorization: Bearer <token>
```

### Réservations

#### Créer une réservation

```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "tripId": "60d5ec49f1b2c72b8c8e4f1a",
  "seats": 2,
  "message": "J'arrive à l'heure !"
}
```

#### Mes réservations

```http
GET /api/bookings/my/bookings
Authorization: Bearer <token>
```

#### Confirmer/Annuler une réservation

```http
PUT /api/bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

### Utilisateurs

#### Récupérer un profil

```http
GET /api/users/:id
```

#### Mettre à jour son profil

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jean",
  "lastName": "Martin",
  "bio": "Conducteur expérimenté"
}
```

#### Upload photo de profil

```http
POST /api/users/profile-picture
Authorization: Bearer <token>
Content-Type: multipart/form-data

profilePicture: <fichier image>
```

## 🗄️ Modèles de données

### User

```typescript
{
  _id: ObjectId,
  email: string,
  password: string (hashé),
  firstName: string,
  lastName: string,
  phoneNumber?: string,
  profilePicture?: string,
  bio?: string,
  rating: number,
  totalRatings: number,
  tripsAsDriver: number,
  tripsAsPassenger: number,
  authProvider: 'email' | 'facebook' | 'google',
  createdAt: Date,
  updatedAt: Date
}
```

### Trip

```typescript
{
  _id: ObjectId,
  driver: ObjectId (ref: User),
  departure: {
    type: 'Point',
    coordinates: [longitude, latitude],
    city: string,
    address?: string
  },
  destination: { /* same as departure */ },
  departureTime: Date,
  arrivalTime: Date,
  price: number,
  availableSeats: number,
  totalSeats: number,
  description?: string,
  vehicleInfo?: {
    brand: string,
    model: string,
    color: string,
    licensePlate: string
  },
  status: 'active' | 'completed' | 'cancelled',
  passengers: ObjectId[],
  createdAt: Date,
  updatedAt: Date
}
```

### Booking

```typescript
{
  _id: ObjectId,
  trip: ObjectId (ref: Trip),
  passenger: ObjectId (ref: User),
  driver: ObjectId (ref: User),
  seats: number,
  totalPrice: number,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  message?: string,
  cancellationReason?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Review

```typescript
{
  _id: ObjectId,
  trip: ObjectId (ref: Trip),
  booking: ObjectId (ref: Booking),
  reviewer: ObjectId (ref: User),
  reviewee: ObjectId (ref: User),
  rating: number (1-5),
  comment?: string,
  reviewerRole: 'driver' | 'passenger',
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Sécurité

### Mesures de sécurité implémentées

- **Helmet**: Protection des headers HTTP
- **CORS**: Configuration stricte des origines autorisées
- **Rate Limiting**: Protection contre les abus (100 req/15min)
- **JWT**: Authentification sécurisée avec tokens
- **Bcrypt**: Hash des mots de passe (10 rounds)
- **Validation**: Validation stricte des données entrantes
- **Mongoose**: Protection contre les injections NoSQL

### Bonnes pratiques

- Ne jamais commiter le fichier `.env`
- Utiliser des secrets forts pour JWT
- Changer les secrets en production
- Activer HTTPS en production
- Configurer MongoDB avec authentification
- Limiter les tailles d'upload

## 🚀 Déploiement

### Option 1: Heroku

```bash
# Créer une app
heroku create mon-app-covoiturage

# Configurer les variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=<votre_uri_mongodb_atlas>
heroku config:set JWT_SECRET=<votre_secret>
# ... autres variables

# Déployer
git push heroku main
```

### Option 2: Railway

1. Créer un compte sur https://railway.app
2. Connecter votre repository GitHub
3. Configurer les variables d'environnement
4. Railway déploie automatiquement

### Option 3: VPS (DigitalOcean, AWS, etc.)

```bash
# Se connecter au serveur
ssh user@votre-serveur

# Installer Node.js et MongoDB
# ...

# Cloner le projet
git clone <votre-repo>
cd backend

# Installer les dépendances
npm install

# Compiler TypeScript
npm run build

# Utiliser PM2 pour gérer le processus
npm install -g pm2
pm2 start dist/server.js --name covoiturage-api
pm2 startup
pm2 save
```

## 📝 Scripts disponibles

```bash
npm run dev      # Démarrer en mode développement avec nodemon
npm run build    # Compiler TypeScript vers JavaScript
npm start        # Démarrer le serveur compilé
npm run lint     # Vérifier le code avec ESLint
```

## 🐛 Dépannage

### Erreur de connexion MongoDB

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Vérifier que MongoDB est démarré ou que l'URI Atlas est correcte.

### Erreur Token JWT

```
Error: Token invalide ou expiré
```

**Solution**: Rafraîchir le token ou se reconnecter.

### Erreur Upload Cloudinary

```
Error: Erreur lors de l'upload de l'image
```

**Solution**: Vérifier les credentials Cloudinary dans `.env`.

## 📄 Licence

MIT

## 👨‍💻 Auteur

Développé pour l'application mobile de covoiturage.

---

**Pour toute question ou problème, n'hésitez pas à ouvrir une issue !** 🚗

