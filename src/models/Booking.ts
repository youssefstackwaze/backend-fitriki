import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface pour le document Booking
 */
export interface IBooking extends Document {
  trip: mongoose.Types.ObjectId;
  passenger: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  seats: number;
  totalPrice: number;
  appCommission: number; // Commission de l'application (16%)
  driverAmount: number; // Montant que le conducteur recevra (totalPrice - commission)
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message?: string;
  negotiationId?: mongoose.Types.ObjectId; // Référence à la négociation si prix négocié
  cancellationReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  cancelledAt?: Date;
  confirmedAt?: Date;
  cancellationFee?: number; // Frais d'annulation (200 DA si applicable)
  driverLocationAtCancellation?: {
    latitude: number;
    longitude: number;
  };
  passengerLocationAtCancellation?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schéma Mongoose pour Booking
 */
const BookingSchema = new Schema<IBooking>(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Le trajet est requis'],
    },
    passenger: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Le passager est requis'],
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Le conducteur est requis'],
    },
    seats: {
      type: Number,
      required: [true, 'Le nombre de places est requis'],
      min: [1, 'Au moins une place doit être réservée'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Le prix total est requis'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    appCommission: {
      type: Number,
      required: [true, 'La commission de l\'application est requise'],
      min: [0, 'La commission ne peut pas être négative'],
    },
    driverAmount: {
      type: Number,
      required: [true, 'Le montant du conducteur est requis'],
      min: [0, 'Le montant du conducteur ne peut pas être négatif'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    message: {
      type: String,
      maxlength: [500, 'Le message ne peut pas dépasser 500 caractères'],
    },
    negotiationId: {
      type: Schema.Types.ObjectId,
      ref: 'Negotiation',
    },
    cancellationReason: {
      type: String,
      maxlength: [500, 'La raison d\'annulation ne peut pas dépasser 500 caractères'],
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: {
      type: Date,
    },
    confirmedAt: {
      type: Date,
    },
    cancellationFee: {
      type: Number,
      default: 0,
      min: [0, 'Les frais d\'annulation ne peuvent pas être négatifs'],
    },
    driverLocationAtCancellation: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    passengerLocationAtCancellation: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
BookingSchema.index({ trip: 1, passenger: 1 }, { unique: true });
BookingSchema.index({ passenger: 1, status: 1 });
BookingSchema.index({ driver: 1, status: 1 });
BookingSchema.index({ trip: 1, status: 1 });

// Empêcher un conducteur de réserver son propre trajet
BookingSchema.pre('save', async function (next) {
  if (this.isNew) {
    const Trip = mongoose.model('Trip');
    const trip = await Trip.findById(this.trip);
    
    if (!trip) {
      return next(new Error('Trajet non trouvé'));
    }
    
    if (trip.driver.toString() === this.passenger.toString()) {
      return next(new Error('Vous ne pouvez pas réserver votre propre trajet'));
    }
  }
  next();
});

export default mongoose.model<IBooking>('Booking', BookingSchema);

