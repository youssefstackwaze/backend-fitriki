import { Request } from 'express';

/**
 * Types personnalisés pour l'application
 */

// Extension de la requête Express pour inclure l'utilisateur authentifié
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  admin?: {
    id: string;
    role: string;
    permissions?: string[];
    zone?: {
      wilaya?: string;
      cities?: string[];
    };
  };
}

// Types pour les localisations
export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  city: string;
  address?: string;
}

// Types pour l'authentification
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
  wilaya?: string;
}

// Types pour les trajets
export interface CreateTripData {
  departure: {
    city: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  destination: {
    city: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  departureTime: Date | string;
  price: number;
  priceType?: 'fixed' | 'negotiable';
  availableSeats: number;
  description?: string;
  vehicleInfo?: {
    brand: string;
    model: string;
    color: string;
    licensePlate: string;
  };
}

export interface SearchTripQuery {
  departureCity?: string;
  destinationCity?: string;
  departureLatitude?: number;
  departureLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  date?: string;
  minSeats?: number;
  maxPrice?: number;
  radius?: number; // en km
}

// Types pour les réservations
export interface CreateBookingData {
  tripId: string;
  seats: number;
  message?: string;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

// Types pour les avis
export interface CreateReviewData {
  tripId: string;
  rating: number;
  comment?: string;
}

// Type pour les réponses d'erreur
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: any[];
}

// Type pour les réponses de succès
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

// Type pour le véhicule
export interface VehicleData {
  brand: string;
  model: string;
  year?: number;
  color?: string;
  licensePlate?: string;
}

// Type pour la mise à jour de profil
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  profilePicture?: string;
  cin?: string;
  driverLicenseNumber?: string;
  vehicle?: VehicleData;
  wilaya?: string;
}

// Types pour les négociations
export interface CreateNegotiationData {
  tripId: string;
  proposedPrice: number;
  message?: string;
}

export interface CounterOfferData {
  counterPrice: number;
  message?: string;
}

export interface NegotiationMessageData {
  message?: string;
}

export enum NegotiationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

