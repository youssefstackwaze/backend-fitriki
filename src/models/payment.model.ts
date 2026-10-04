import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  driver: mongoose.Types.ObjectId;
  amount: number; // Montant de la commission à payer
  period: {
    month: number;
    year: number;
  };
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: 'cash' | 'bank_transfer' | 'mobile_payment';
  transactionReference?: string;
  verifiedBy?: mongoose.Types.ObjectId; // Admin qui a vérifié
  notes?: string;
  trips: mongoose.Types.ObjectId[]; // Liste des trajets concernés
  totalEarnings: number; // Total gagné par le conducteur
  commissionRate: number; // Taux de commission appliqué (en %)
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
      },
      year: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'mobile_payment'],
    },
    transactionReference: {
      type: String,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    notes: {
      type: String,
    },
    trips: [{
      type: Schema.Types.ObjectId,
      ref: 'Trip',
    }],
    totalEarnings: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour la recherche
paymentSchema.index({ driver: 1, 'period.month': 1, 'period.year': 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ dueDate: 1 });

// Méthode pour marquer comme en retard automatiquement
paymentSchema.pre('save', function (next) {
  if (this.status === 'pending' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  next();
});

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

