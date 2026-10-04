import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Interface pour le document User
 */
/**
 * Interface pour le véhicule de l'utilisateur
 */
export interface IVehicle {
  brand: string;
  model: string;
  year?: number;
  color?: string;
  licensePlate?: string;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  bio?: string;
  cin?: string;
  driverLicenseNumber?: string;
  vehicle?: IVehicle;
  rating: number;
  totalRatings: number;
  tripsAsDriver: number;
  tripsAsPassenger: number;
  authProvider: 'email' | 'google';
  googleId?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;
  phoneVerificationCode?: string;
  phoneVerificationExpires?: Date;
  resetPasswordCode?: string;
  resetPasswordExpires?: Date;
  refreshToken?: string;
  city?: string;
  wilaya?: string;
  role?: 'passenger' | 'driver' | 'both';
  totalTrips?: number;
  isBlocked?: boolean;
  blockReason?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Méthodes
  comparePassword(candidatePassword: string): Promise<boolean>;
  getAverageRating(): number;
}

/**
 * Schéma Mongoose pour User
 */
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide'],
    },
    password: {
      type: String,
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false, // Ne pas retourner le password par défaut
    },
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, 'La bio ne peut pas dépasser 500 caractères'],
    },
    cin: {
      type: String,
      trim: true,
      uppercase: true,
    },
    driverLicenseNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    vehicle: {
      brand: {
        type: String,
        trim: true,
      },
      model: {
        type: String,
        trim: true,
      },
      year: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear() + 1,
      },
      color: {
        type: String,
        trim: true,
      },
      licensePlate: {
        type: String,
        trim: true,
        uppercase: true,
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    tripsAsDriver: {
      type: Number,
      default: 0,
    },
    tripsAsPassenger: {
      type: Number,
      default: 0,
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    phoneVerificationCode: {
      type: String,
      select: false,
    },
    phoneVerificationExpires: {
      type: Date,
      select: false,
    },
    resetPasswordCode: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    city: {
      type: String,
      trim: true,
    },
    wilaya: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['passenger', 'driver', 'both'],
      default: 'passenger',
    },
    totalTrips: {
      type: Number,
      default: 0,
      min: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        // Supprimer les champs sensibles
        const { password: _password, refreshToken: _refreshToken, __v: _v, ...rest } = ret;
        return rest;
      },
    },
  }
);

// Index pour améliorer les performances de recherche
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });

// Middleware pour hasher le password avant de sauvegarder
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour calculer la note moyenne
UserSchema.methods.getAverageRating = function (): number {
  if (this.totalRatings === 0) return 0;
  return Math.round((this.rating / this.totalRatings) * 10) / 10;
};

export default mongoose.model<IUser>('User', UserSchema);

