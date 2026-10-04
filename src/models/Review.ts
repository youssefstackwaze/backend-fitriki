import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface pour le document Review
 */
export interface IReview extends Document {
  trip: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  reviewerRole: 'driver' | 'passenger';
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schéma Mongoose pour Review
 */
const ReviewSchema = new Schema<IReview>(
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
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'auteur de l\'avis est requis'],
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur évalué est requis'],
    },
    rating: {
      type: Number,
      required: [true, 'La note est requise'],
      min: [1, 'La note minimale est 1'],
      max: [5, 'La note maximale est 5'],
    },
    comment: {
      type: String,
      maxlength: [1000, 'Le commentaire ne peut pas dépasser 1000 caractères'],
    },
    reviewerRole: {
      type: String,
      enum: ['driver', 'passenger'],
      required: [true, 'Le rôle de l\'auteur est requis'],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour éviter les doublons et améliorer les performances
ReviewSchema.index({ booking: 1, reviewer: 1 }, { unique: true });
ReviewSchema.index({ reviewee: 1, createdAt: -1 });
ReviewSchema.index({ trip: 1 });

// Empêcher de s'évaluer soi-même
ReviewSchema.pre('save', function (next) {
  if (this.reviewer.toString() === this.reviewee.toString()) {
    return next(new Error('Vous ne pouvez pas vous évaluer vous-même'));
  }
  next();
});

// Mettre à jour la note de l'utilisateur après l'ajout d'un avis
ReviewSchema.post('save', async function () {
  try {
    const User = mongoose.model('User');
    const Review = mongoose.model('Review');
    
    // Calculer la nouvelle moyenne des notes
    const reviews = await Review.find({ reviewee: this.reviewee });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(this.reviewee, {
      rating: averageRating,
      totalRatings: reviews.length,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note:', error);
  }
});

export default mongoose.model<IReview>('Review', ReviewSchema);

