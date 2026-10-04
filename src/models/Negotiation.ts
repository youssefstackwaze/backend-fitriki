import mongoose, { Schema, Document } from 'mongoose';

export interface INegotiationMessage {
  sender: mongoose.Types.ObjectId;
  senderType: 'passenger' | 'driver';
  message: string;
  priceOffer?: number;
  createdAt: Date;
}

export interface INegotiation extends Document {
  trip: mongoose.Types.ObjectId;
  passenger: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  originalPrice: number;
  currentOffer: number; // La dernière offre faite
  lastOfferBy: 'passenger' | 'driver'; // Qui a fait la dernière offre
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  messages: INegotiationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const NegotiationMessageSchema = new Schema<INegotiationMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderType: {
      type: String,
      enum: ['passenger', 'driver'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    priceOffer: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const NegotiationSchema = new Schema<INegotiation>(
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
    originalPrice: {
      type: Number,
      required: [true, 'Le prix original est requis'],
    },
    currentOffer: {
      type: Number,
      required: [true, 'L\'offre actuelle est requise'],
    },
    lastOfferBy: {
      type: String,
      enum: ['passenger', 'driver'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    messages: [NegotiationMessageSchema],
  },
  {
    timestamps: true,
  }
);

// Index pour rechercher les négociations d'un trajet
NegotiationSchema.index({ trip: 1 });
NegotiationSchema.index({ passenger: 1 });
NegotiationSchema.index({ driver: 1 });
// Un passager ne peut avoir qu'une négociation en attente par trajet
NegotiationSchema.index(
  { trip: 1, passenger: 1, status: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { status: 'pending' } 
  }
);

const Negotiation = mongoose.model<INegotiation>('Negotiation', NegotiationSchema);

export default Negotiation;

