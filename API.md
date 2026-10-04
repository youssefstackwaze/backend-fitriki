# 📡 Documentation complète de l'API

## Base URL

```
http://localhost:3000/api
```

En production : `https://votre-domaine.com/api`

## 🔐 Authentification

Toutes les routes protégées nécessitent un header `Authorization` :

```http
Authorization: Bearer <votre_token_jwt>
```

---

## 🔑 Routes d'authentification

### 1. Inscription par email

**POST** `/api/auth/signup`

Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "jean.dupont@email.com",
  "password": "motdepasse123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phoneNumber": "0612345678"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d5ec49f1b2c72b8c8e4f1a",
      "email": "jean.dupont@email.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "phoneNumber": "0612345678",
      "profilePicture": null,
      "bio": null,
      "rating": 0,
      "tripsCount": 0,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Inscription réussie"
}
```

---

### 2. Connexion par email

**POST** `/api/auth/login`

Se connecter avec email et mot de passe.

**Body:**
```json
{
  "email": "jean.dupont@email.com",
  "password": "motdepasse123"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* ... */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Connexion réussie"
}
```

---

### 3. Authentification Facebook

**POST** `/api/auth/facebook`

Se connecter ou s'inscrire via Facebook.

**Body:**
```json
{
  "facebookToken": "EAAGm0PX4ZCpsBO...",
  "facebookId": "123456789012345"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* ... */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Authentification Facebook réussie"
}
```

---

### 4. Récupérer le profil connecté

**GET** `/api/auth/me`

🔒 **Protégé** - Nécessite authentification

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "email": "jean.dupont@email.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phoneNumber": "0612345678",
    "profilePicture": "https://res.cloudinary.com/...",
    "bio": "Conducteur expérimenté",
    "rating": 4.5,
    "tripsCount": 12,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 5. Déconnexion

**POST** `/api/auth/logout`

🔒 **Protégé** - Nécessite authentification

**Réponse (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Déconnexion réussie"
}
```

---

## 👤 Routes utilisateur

### 1. Récupérer un profil utilisateur

**GET** `/api/users/:id`

Récupérer le profil public d'un utilisateur.

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "email": "jean.dupont@email.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "profilePicture": "https://...",
    "bio": "Conducteur sympa",
    "rating": 4.8,
    "totalRatings": 25,
    "tripsAsDriver": 15,
    "tripsAsPassenger": 8,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Mettre à jour son profil

**PUT** `/api/users/profile`

🔒 **Protégé** - Nécessite authentification

**Body:**
```json
{
  "firstName": "Jean",
  "lastName": "Martin",
  "phoneNumber": "0698765432",
  "bio": "J'adore conduire et rencontrer de nouvelles personnes !"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "email": "jean.dupont@email.com",
    "firstName": "Jean",
    "lastName": "Martin",
    "phoneNumber": "0698765432",
    "profilePicture": "https://...",
    "bio": "J'adore conduire et rencontrer de nouvelles personnes !",
    "rating": 4.8,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Profil mis à jour avec succès"
}
```

---

### 3. Upload photo de profil

**POST** `/api/users/profile-picture`

🔒 **Protégé** - Nécessite authentification

**Content-Type:** `multipart/form-data`

**Form Data:**
- `profilePicture`: fichier image (JPEG, PNG, WEBP, max 5MB)

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "profilePicture": "https://res.cloudinary.com/..."
  },
  "message": "Photo de profil mise à jour avec succès"
}
```

---

### 4. Récupérer les trajets d'un utilisateur

**GET** `/api/users/:id/trips`

**Query params:**
- `role` (optionnel): `driver` ou `passenger` (défaut: `driver`)
- `status` (optionnel): `active`, `completed`, `cancelled`

**Exemple:** `/api/users/60d5ec49f1b2c72b8c8e4f1a/trips?role=driver&status=active`

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1b",
      "driver": { /* ... */ },
      "departure": {
        "city": "Paris",
        "coordinates": [2.3739, 48.8447]
      },
      "destination": {
        "city": "Lyon",
        "coordinates": [4.8590, 45.7603]
      },
      "departureTime": "2024-06-15T14:00:00.000Z",
      "price": 25,
      "availableSeats": 2,
      "status": "active"
    }
  ]
}
```

---

### 5. Récupérer les avis d'un utilisateur

**GET** `/api/users/:id/reviews`

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1c",
      "reviewer": {
        "firstName": "Marie",
        "lastName": "D.",
        "profilePicture": "https://..."
      },
      "rating": 5,
      "comment": "Excellent conducteur, très ponctuel !",
      "reviewerRole": "passenger",
      "createdAt": "2024-06-10T15:30:00.000Z"
    }
  ]
}
```

---

### 6. Supprimer son compte

**DELETE** `/api/users/account`

🔒 **Protégé** - Nécessite authentification

**Réponse (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Compte supprimé avec succès"
}
```

**Erreur (400):**
```json
{
  "success": false,
  "message": "Impossible de supprimer le compte. Vous avez des trajets actifs en cours."
}
```

---

## 🚗 Routes trajets

### 1. Créer un trajet

**POST** `/api/trips`

🔒 **Protégé** - Nécessite authentification

**Body:**
```json
{
  "departure": {
    "city": "Paris",
    "address": "Gare de Lyon",
    "latitude": 48.8447,
    "longitude": 2.3739
  },
  "destination": {
    "city": "Lyon",
    "address": "Gare Part-Dieu",
    "latitude": 45.7603,
    "longitude": 4.8590
  },
  "departureTime": "2024-06-15T14:00:00Z",
  "arrivalTime": "2024-06-15T18:30:00Z",
  "price": 25,
  "availableSeats": 3,
  "description": "Trajet tranquille avec pause café en route. Non fumeur.",
  "vehicleInfo": {
    "brand": "Renault",
    "model": "Clio",
    "color": "Bleu",
    "licensePlate": "AB-123-CD"
  }
}
```

**Réponse (201):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1b",
    "driver": {
      "firstName": "Jean",
      "lastName": "Dupont",
      "profilePicture": "https://...",
      "rating": 4.8
    },
    "departure": { /* ... */ },
    "destination": { /* ... */ },
    "departureTime": "2024-06-15T14:00:00.000Z",
    "arrivalTime": "2024-06-15T18:30:00.000Z",
    "price": 25,
    "availableSeats": 3,
    "totalSeats": 3,
    "description": "Trajet tranquille...",
    "status": "active",
    "createdAt": "2024-06-01T10:00:00.000Z"
  },
  "message": "Trajet créé avec succès"
}
```

---

### 2. Rechercher des trajets

**GET** `/api/trips/search`

**Query params:**
- `departureCity` (optionnel): Ville de départ
- `destinationCity` (optionnel): Ville de destination
- `date` (optionnel): Date au format ISO (YYYY-MM-DD)
- `minSeats` (optionnel): Nombre minimum de places
- `maxPrice` (optionnel): Prix maximum
- `latitude` & `longitude` (optionnel): Recherche par proximité
- `radius` (optionnel): Rayon en km (défaut: 50)

**Exemple:** `/api/trips/search?departureCity=Paris&destinationCity=Lyon&date=2024-06-15&minSeats=2&maxPrice=30`

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1b",
      "driver": {
        "firstName": "Jean",
        "lastName": "D.",
        "profilePicture": "https://...",
        "rating": 4.8
      },
      "departure": {
        "city": "Paris",
        "address": "Gare de Lyon",
        "coordinates": [2.3739, 48.8447]
      },
      "destination": {
        "city": "Lyon",
        "address": "Part-Dieu",
        "coordinates": [4.8590, 45.7603]
      },
      "departureTime": "2024-06-15T14:00:00.000Z",
      "arrivalTime": "2024-06-15T18:30:00.000Z",
      "price": 25,
      "availableSeats": 2,
      "totalSeats": 3,
      "status": "active"
    }
  ]
}
```

---

### 3. Récupérer un trajet

**GET** `/api/trips/:id`

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1b",
    "driver": {
      "firstName": "Jean",
      "lastName": "Dupont",
      "profilePicture": "https://...",
      "rating": 4.8,
      "bio": "Conducteur expérimenté",
      "totalRatings": 25
    },
    "departure": { /* ... */ },
    "destination": { /* ... */ },
    "departureTime": "2024-06-15T14:00:00.000Z",
    "price": 25,
    "availableSeats": 2,
    "totalSeats": 3,
    "description": "Trajet tranquille...",
    "vehicleInfo": {
      "brand": "Renault",
      "model": "Clio",
      "color": "Bleu"
    },
    "passengers": [
      {
        "firstName": "Marie",
        "lastName": "M.",
        "profilePicture": "https://..."
      }
    ],
    "status": "active"
  }
}
```

---

### 4. Mes trajets

**GET** `/api/trips/my/trips`

🔒 **Protégé** - Nécessite authentification

**Query params:**
- `status` (optionnel): `active`, `completed`, `cancelled`

**Réponse (200):**
```json
{
  "success": true,
  "data": [ /* Liste des trajets */ ]
}
```

---

### 5. Mettre à jour un trajet

**PUT** `/api/trips/:id`

🔒 **Protégé** - Nécessite authentification (être le conducteur)

**Body:**
```json
{
  "departureTime": "2024-06-15T15:00:00Z",
  "price": 30,
  "availableSeats": 2,
  "description": "Nouvelle description"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "data": { /* Trajet mis à jour */ },
  "message": "Trajet mis à jour avec succès"
}
```

---

### 6. Annuler un trajet

**DELETE** `/api/trips/:id`

🔒 **Protégé** - Nécessite authentification (être le conducteur)

**Réponse (200):**
```json
{
  "success": true,
  "data": { /* Trajet annulé */ },
  "message": "Trajet annulé avec succès"
}
```

---

## 📅 Routes réservations

### 1. Créer une réservation

**POST** `/api/bookings`

🔒 **Protégé** - Nécessite authentification

**Body:**
```json
{
  "tripId": "60d5ec49f1b2c72b8c8e4f1b",
  "seats": 2,
  "message": "Bonjour, j'arrive à l'heure !"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1d",
    "trip": { /* Détails du trajet */ },
    "passenger": {
      "firstName": "Marie",
      "lastName": "Martin",
      "profilePicture": "https://..."
    },
    "seats": 2,
    "totalPrice": 50,
    "status": "pending",
    "message": "Bonjour, j'arrive à l'heure !",
    "createdAt": "2024-06-10T10:00:00.000Z"
  },
  "message": "Réservation créée avec succès"
}
```

---

### 2. Mes réservations

**GET** `/api/bookings/my/bookings`

🔒 **Protégé** - Nécessite authentification

**Query params:**
- `status` (optionnel): `pending`, `confirmed`, `cancelled`, `completed`

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1d",
      "trip": {
        "departure": { "city": "Paris" },
        "destination": { "city": "Lyon" },
        "departureTime": "2024-06-15T14:00:00.000Z",
        "driver": {
          "firstName": "Jean",
          "lastName": "D.",
          "rating": 4.8
        }
      },
      "seats": 2,
      "totalPrice": 50,
      "status": "confirmed"
    }
  ]
}
```

---

### 3. Récupérer une réservation

**GET** `/api/bookings/:id`

🔒 **Protégé** - Nécessite authentification (passager ou conducteur)

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1d",
    "trip": { /* Détails complets */ },
    "passenger": { /* Infos passager */ },
    "driver": { /* Infos conducteur */ },
    "seats": 2,
    "totalPrice": 50,
    "status": "confirmed",
    "message": "Bonjour...",
    "createdAt": "2024-06-10T10:00:00.000Z"
  }
}
```

---

### 4. Réservations d'un trajet

**GET** `/api/bookings/trip/:tripId`

🔒 **Protégé** - Nécessite authentification (être le conducteur)

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1d",
      "passenger": {
        "firstName": "Marie",
        "lastName": "Martin",
        "profilePicture": "https://...",
        "phoneNumber": "0612345678",
        "rating": 4.5
      },
      "seats": 2,
      "totalPrice": 50,
      "status": "pending",
      "createdAt": "2024-06-10T10:00:00.000Z"
    }
  ]
}
```

---

### 5. Mettre à jour le statut d'une réservation

**PUT** `/api/bookings/:id/status`

🔒 **Protégé** - Nécessite authentification (passager ou conducteur)

**Body:**
```json
{
  "status": "confirmed",
  "cancellationReason": "Optionnel si status = cancelled"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "data": { /* Réservation mise à jour */ },
  "message": "Réservation confirmée avec succès"
}
```

---

### 6. Créer un avis

**POST** `/api/bookings/:id/review`

🔒 **Protégé** - Nécessite authentification

**Body:**
```json
{
  "rating": 5,
  "comment": "Excellent conducteur, très ponctuel et sympa !"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1e",
    "reviewer": {
      "firstName": "Marie",
      "lastName": "M.",
      "profilePicture": "https://..."
    },
    "reviewee": {
      "firstName": "Jean",
      "lastName": "D."
    },
    "rating": 5,
    "comment": "Excellent conducteur...",
    "reviewerRole": "passenger",
    "createdAt": "2024-06-16T10:00:00.000Z"
  },
  "message": "Avis créé avec succès"
}
```

---

## ❌ Gestion des erreurs

Toutes les erreurs suivent ce format :

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "errors": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

### Codes HTTP

- `200` - Succès
- `201` - Ressource créée
- `400` - Erreur de validation
- `401` - Non authentifié
- `403` - Non autorisé
- `404` - Ressource non trouvée
- `409` - Conflit (ex: email déjà utilisé)
- `429` - Trop de requêtes (rate limiting)
- `500` - Erreur serveur

---

## 🔍 Exemples avec cURL

### Inscription

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

### Connexion

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Rechercher des trajets

```bash
curl -X GET "http://localhost:3000/api/trips/search?departureCity=Paris&destinationCity=Lyon"
```

### Créer un trajet (avec auth)

```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
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
    "departureTime": "2024-06-15T14:00:00Z",
    "price": 25,
    "availableSeats": 3
  }'
```

---

**Pour plus d'informations, consultez le README.md** 📖

