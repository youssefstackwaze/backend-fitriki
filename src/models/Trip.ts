import mongoose, { Document, Schema } from 'mongoose';
import { APP_COMMISSION_RATE, getCommissionRate } from '../config/constants';

/**
 * Interface pour les locations
 */
interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  city: string;
  address?: string;
}

/**
 * Interface pour les informations du véhicule
 */
interface IVehicleInfo {
  brand: string;
  model: string;
  color: string;
  licensePlate: string;
}

/**
 * Interface pour le document Trip
 */
export interface ITrip extends Document {
  driver: mongoose.Types.ObjectId;
  departure: ILocation;
  destination: ILocation;
  departureTime: Date;
  price: number; // Prix client (avec commission dynamique incluse)
  driverPrice: number; // Prix que le conducteur recevra (price - commission) - champ virtuel
  priceType: 'fixed' | 'negotiable'; // Prix fixe ou négociable
  availableSeats: number;
  description?: string;
  vehicleInfo?: IVehicleInfo;
  status: 'active' | 'completed' | 'cancelled';
  passengers: mongoose.Types.ObjectId[];
  distance?: number; // en km
  createdAt: Date;
  updatedAt: Date;
  
  // Méthode pour calculer le prix du conducteur avec commission dynamique
  getDriverPrice(): Promise<number>;
}

/**
 * Schéma pour les locations avec support GeoJSON
 */
const LocationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    required: false,
    default: [0, 0],
    validate: {
      validator: function (v: number[]) {
        return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
      },
      message: 'Coordonnées invalides [longitude, latitude]',
    },
  },
  city: {
    type: String,
    required: [true, 'La ville est requise'],
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
});

/**
 * Schéma pour les informations du véhicule
 */
const VehicleInfoSchema = new Schema({
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    trim: true,
  },
  licensePlate: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
});

/**
 * Schéma Mongoose pour Trip
 */
const TripSchema = new Schema<ITrip>(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Le conducteur est requis'],
    },
    departure: {
      type: LocationSchema,
      required: [true, 'Le lieu de départ est requis'],
    },
    destination: {
      type: LocationSchema,
      required: [true, 'La destination est requise'],
    },
    departureTime: {
      type: Date,
      required: [true, 'L\'heure de départ est requise'],
    },
    price: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    priceType: {
      type: String,
      enum: ['fixed', 'negotiable'],
      default: 'fixed',
      required: [true, 'Le type de prix est requis'],
    },
    availableSeats: {
      type: Number,
      required: [true, 'Le nombre de places disponibles est requis'],
      min: [0, 'Le nombre de places ne peut pas être négatif'],
      max: [8, 'Maximum 8 places autorisées'],
    },
    description: {
      type: String,
      maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères'],
    },
    vehicleInfo: {
      type: VehicleInfoSchema,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    passengers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    distance: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index géospatial pour la recherche par proximité
TripSchema.index({ 'departure.coordinates': '2dsphere' });
TripSchema.index({ 'destination.coordinates': '2dsphere' });

// Index pour améliorer les performances
TripSchema.index({ driver: 1, departureTime: -1 });
TripSchema.index({ status: 1, departureTime: 1 });
TripSchema.index({ departureTime: 1 });

// Champ virtuel pour calculer le prix que le conducteur recevra (DEPRECATED - utiliser getDriverPrice())
TripSchema.virtual('driverPrice').get(function() {
  // Le prix stocké est le prix client (avec commission)
  // On calcule le prix conducteur : prix client - commission statique (DEPRECATED)
  const commission = this.price * APP_COMMISSION_RATE;
  return this.price - commission;
});

// Méthode pour calculer le prix du conducteur avec le taux de commission dynamique
TripSchema.methods.getDriverPrice = async function(): Promise<number> {
  const commissionRate = await getCommissionRate();
  const commission = this.price * commissionRate;
  return this.price - commission;
};

// Middleware pour mettre à jour le statut automatiquement
TripSchema.pre('save', function (next) {
  if (this.departureTime < new Date() && this.status === 'active') {
    this.status = 'completed';
  }
  next();
});

export default mongoose.model<ITrip>('Trip', TripSchema);

