import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface pour le document Complaint (Réclamation)
 */
export interface IComplaint extends Document {
  trip: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  complainant: mongoose.Types.ObjectId; // Celui qui fait la réclamation
  accused: mongoose.Types.ObjectId; // Celui qui est accusé
  complainantRole: 'driver' | 'passenger';
  reason: string;
  description: string;
  status: 'pending' | 'in_review' | 'resolved' | 'rejected';
  adminNote?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schéma Mongoose pour Complaint
 */
const ComplaintSchema = new Schema<IComplaint>(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Le trajet est requis'],
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'La réservation est requise'],
    },
    complainant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'auteur de la réclamation est requis'],
    },
    accused: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur accusé est requis'],
    },
    complainantRole: {
      type: String,
      enum: ['driver', 'passenger'],
      required: [true, 'Le rôle de l\'auteur est requis'],
    },
    reason: {
      type: String,
      required: [true, 'La raison est requise'],
      enum: [
        'Comportement inapproprié',
        'Non-respect des horaires',
        'Véhicule non conforme',
        'Trajet non effectué',
        'Conduite dangereuse',
        'Non-respect du lieu de départ',
        'Non-respect du lieu d\'arrivée',
        'Prix non respecté',
        'Autre',
      ],
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'],
    },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'resolved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      maxlength: [1000, 'La note admin ne peut pas dépasser 1000 caractères'],
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
ComplaintSchema.index({ booking: 1 });
ComplaintSchema.index({ complainant: 1, createdAt: -1 });
ComplaintSchema.index({ accused: 1, createdAt: -1 });
ComplaintSchema.index({ status: 1, createdAt: -1 });

// Empêcher de faire une réclamation contre soi-même
ComplaintSchema.pre('save', function (next) {
  if (this.complainant.toString() === this.accused.toString()) {
    return next(new Error('Vous ne pouvez pas faire une réclamation contre vous-même'));
  }
  next();
});

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);


