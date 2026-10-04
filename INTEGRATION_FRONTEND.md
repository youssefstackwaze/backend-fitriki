# 🔗 Intégration avec le Frontend React Native

Guide complet pour connecter votre application React Native au backend.

## 📦 Installation des dépendances frontend

Dans votre projet React Native (`covoiturage-app`), installez :

```bash
npm install axios
npm install @react-native-async-storage/async-storage
```

## 🔧 Configuration de l'API

### 1. Créer le service API

Créer `covoiturage-app/services/api.ts` :

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de l'API
const API_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Développement
  : 'https://votre-api.com/api';  // Production

// Instance Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré, déconnecter l'utilisateur
      await AsyncStorage.removeItem('userToken');
      // Rediriger vers login
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔐 Authentification

### Service d'authentification

Créer `covoiturage-app/services/auth-service.ts` :

```typescript
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export const authService = {
  // Inscription
  async signup(credentials: SignupCredentials) {
    const response = await api.post('/auth/signup', credentials);
    const { token, user } = response.data.data;
    
    // Sauvegarder le token
    await AsyncStorage.setItem('userToken', token);
    
    return { token, user };
  },

  // Connexion
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data.data;
    
    await AsyncStorage.setItem('userToken', token);
    
    return { token, user };
  },

  // Authentification Facebook
  async loginWithFacebook(facebookToken: string, facebookId: string) {
    const response = await api.post('/auth/facebook', {
      facebookToken,
      facebookId,
    });
    const { token, user } = response.data.data;
    
    await AsyncStorage.setItem('userToken', token);
    
    return { token, user };
  },

  // Récupérer le profil
  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  // Déconnexion
  async logout() {
    await api.post('/auth/logout');
    await AsyncStorage.removeItem('userToken');
  },

  // Vérifier si l'utilisateur est connecté
  async isAuthenticated() {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  },
};
```

---

## 🚗 Gestion des trajets

### Service trajets

Créer `covoiturage-app/services/trip-service.ts` :

```typescript
import api from './api';

export interface CreateTripData {
  departure: {
    city: string;
    address?: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    city: string;
    address?: string;
    latitude: number;
    longitude: number;
  };
  departureTime: Date;
  arrivalTime?: Date;
  price: number;
  availableSeats: number;
  description?: string;
}

export interface SearchParams {
  departureCity?: string;
  destinationCity?: string;
  date?: string;
  minSeats?: number;
  maxPrice?: number;
}

export const tripService = {
  // Créer un trajet
  async createTrip(data: CreateTripData) {
    const response = await api.post('/trips', data);
    return response.data.data;
  },

  // Rechercher des trajets
  async searchTrips(params: SearchParams) {
    const response = await api.get('/trips/search', { params });
    return response.data.data;
  },

  // Récupérer un trajet
  async getTripById(id: string) {
    const response = await api.get(`/trips/${id}`);
    return response.data.data;
  },

  // Mes trajets
  async getMyTrips(status?: string) {
    const response = await api.get('/trips/my/trips', {
      params: { status },
    });
    return response.data.data;
  },

  // Mettre à jour un trajet
  async updateTrip(id: string, data: Partial<CreateTripData>) {
    const response = await api.put(`/trips/${id}`, data);
    return response.data.data;
  },

  // Annuler un trajet
  async cancelTrip(id: string) {
    const response = await api.delete(`/trips/${id}`);
    return response.data.data;
  },
};
```

---

## 📅 Gestion des réservations

### Service réservations

Créer `covoiturage-app/services/booking-service.ts` :

```typescript
import api from './api';

export interface CreateBookingData {
  tripId: string;
  seats: number;
  message?: string;
}

export const bookingService = {
  // Créer une réservation
  async createBooking(data: CreateBookingData) {
    const response = await api.post('/bookings', data);
    return response.data.data;
  },

  // Mes réservations
  async getMyBookings(status?: string) {
    const response = await api.get('/bookings/my/bookings', {
      params: { status },
    });
    return response.data.data;
  },

  // Récupérer une réservation
  async getBookingById(id: string) {
    const response = await api.get(`/bookings/${id}`);
    return response.data.data;
  },

  // Réservations d'un trajet (conducteur)
  async getTripBookings(tripId: string) {
    const response = await api.get(`/bookings/trip/${tripId}`);
    return response.data.data;
  },

  // Confirmer une réservation
  async confirmBooking(id: string) {
    const response = await api.put(`/bookings/${id}/status`, {
      status: 'confirmed',
    });
    return response.data.data;
  },

  // Annuler une réservation
  async cancelBooking(id: string, reason?: string) {
    const response = await api.put(`/bookings/${id}/status`, {
      status: 'cancelled',
      cancellationReason: reason,
    });
    return response.data.data;
  },

  // Créer un avis
  async createReview(bookingId: string, rating: number, comment?: string) {
    const response = await api.post(`/bookings/${bookingId}/review`, {
      rating,
      comment,
    });
    return response.data.data;
  },
};
```

---

## 👤 Gestion des utilisateurs

### Service utilisateurs

Créer `covoiturage-app/services/user-service.ts` :

```typescript
import api from './api';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
}

export const userService = {
  // Récupérer un profil utilisateur
  async getUserProfile(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  // Mettre à jour son profil
  async updateProfile(data: UpdateProfileData) {
    const response = await api.put('/users/profile', data);
    return response.data.data;
  },

  // Upload photo de profil
  async uploadProfilePicture(imageUri: string) {
    const formData = new FormData();
    formData.append('profilePicture', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const response = await api.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Récupérer les trajets d'un utilisateur
  async getUserTrips(id: string, role: 'driver' | 'passenger' = 'driver') {
    const response = await api.get(`/users/${id}/trips`, {
      params: { role },
    });
    return response.data.data;
  },

  // Récupérer les avis d'un utilisateur
  async getUserReviews(id: string) {
    const response = await api.get(`/users/${id}/reviews`);
    return response.data.data;
  },

  // Supprimer son compte
  async deleteAccount() {
    const response = await api.delete('/users/account');
    return response.data;
  },
};
```

---

## 🎣 Hooks personnalisés

### Hook pour l'authentification

Créer `covoiturage-app/hooks/use-auth.ts` :

```typescript
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth-service';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const profile = await authService.getProfile();
        setUser(profile);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user } = await authService.login({ email, password });
      setUser(user);
      return user;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (credentials: any) => {
    try {
      setLoading(true);
      const { user } = await authService.signup(credentials);
      setUser(user);
      return user;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur d\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { user, loading, error, login, signup, logout, checkAuth };
};
```

---

### Hook pour rechercher des trajets

Créer `covoiturage-app/hooks/use-trips.ts` :

```typescript
import { useState, useEffect } from 'react';
import { tripService } from '@/services/trip-service';

export const useTrips = (searchParams?: any) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchTrips = async (params: any) => {
    try {
      setLoading(true);
      const results = await tripService.searchTrips(params);
      setTrips(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams) {
      searchTrips(searchParams);
    }
  }, [JSON.stringify(searchParams)]);

  return { trips, loading, error, searchTrips };
};
```

---

## 💡 Exemples d'utilisation dans les composants

### Écran de connexion

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Connexion échouée');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? 'Connexion...' : 'Se connecter'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
```

---

### Écran de recherche de trajets

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import { useTrips } from '@/hooks/use-trips';

export default function SearchScreen() {
  const [departureCity, setDepartureCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const { trips, loading, searchTrips } = useTrips();

  const handleSearch = () => {
    searchTrips({ departureCity, destinationCity });
  };

  return (
    <View>
      <TextInput
        placeholder="Ville de départ"
        value={departureCity}
        onChangeText={setDepartureCity}
      />
      <TextInput
        placeholder="Ville de destination"
        value={destinationCity}
        onChangeText={setDestinationCity}
      />
      <Button title="Rechercher" onPress={handleSearch} />

      {loading && <Text>Recherche en cours...</Text>}

      <FlatList
        data={trips}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.departure.city} → {item.destination.city}</Text>
            <Text>Prix: {item.price}€</Text>
            <Text>Places: {item.availableSeats}</Text>
          </View>
        )}
      />
    </View>
  );
}
```

---

## 🔧 Configuration pour Android (localhost)

Pour accéder à `localhost:3000` depuis un émulateur Android :

```typescript
// services/api.ts
const API_URL = __DEV__ 
  ? Platform.OS === 'android' 
    ? 'http://10.0.2.2:3000/api'  // Émulateur Android
    : 'http://localhost:3000/api'  // iOS ou web
  : 'https://votre-api.com/api';
```

---

## 📱 Configuration pour un appareil physique

Si vous testez sur un appareil physique :

1. **Trouver l'IP de votre ordinateur** :
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. **Utiliser cette IP dans l'API** :
   ```typescript
   const API_URL = 'http://192.168.1.X:3000/api';
   ```

3. **S'assurer que le backend accepte les connexions de cette IP** (déjà configuré avec CORS)

---

## 🐛 Gestion des erreurs

### Exemple de gestion d'erreurs globale

```typescript
// services/api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erreur de réponse du serveur
      const message = error.response.data?.message || 'Une erreur est survenue';
      
      switch (error.response.status) {
        case 401:
          // Non authentifié - rediriger vers login
          AsyncStorage.removeItem('userToken');
          // router.replace('/login');
          break;
        case 403:
          Alert.alert('Accès refusé', 'Vous n\'avez pas les permissions nécessaires');
          break;
        case 404:
          Alert.alert('Non trouvé', 'La ressource demandée n\'existe pas');
          break;
        case 500:
          Alert.alert('Erreur serveur', 'Une erreur est survenue sur le serveur');
          break;
        default:
          Alert.alert('Erreur', message);
      }
    } else if (error.request) {
      // Pas de réponse du serveur
      Alert.alert('Erreur réseau', 'Impossible de contacter le serveur');
    }
    
    return Promise.reject(error);
  }
);
```

---

## ✅ Checklist d'intégration

- [ ] Installer `axios` et `@react-native-async-storage/async-storage`
- [ ] Créer le service API avec intercepteurs
- [ ] Créer les services pour chaque ressource (auth, trips, bookings, users)
- [ ] Créer les hooks personnalisés
- [ ] Configurer l'URL de l'API selon l'environnement
- [ ] Tester l'authentification
- [ ] Tester la recherche de trajets
- [ ] Tester les réservations
- [ ] Implémenter la gestion d'erreurs
- [ ] Tester sur émulateur et appareil physique

---

**Votre backend est maintenant prêt à être utilisé avec votre application React Native !** 🎉

