import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'super_admin' | 'admin';
  zone?: {
    wilaya: string;
    cities: string[];
  };
  permissions: string[];
  isActive: boolean;
  isBlocked: boolean;
  blockReason?: string;
  createdBy?: mongoose.Types.ObjectId;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: [true, 'Email requis'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    password: {
      type: String,
      required: [true, 'Mot de passe requis'],
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'Prénom requis'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Nom requis'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      match: [/^(05|06|07)[0-9]{8}$/, 'Numéro de téléphone algérien invalide'],
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin'],
      required: true,
      default: 'admin',
    },
    zone: {
      wilaya: {
        type: String,
      },
      cities: [{
        type: String,
      }],
    },
    permissions: [{
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour la recherche
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ 'zone.wilaya': 1 });

// Hash du mot de passe avant sauvegarde
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
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
adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Définir les permissions par défaut selon le rôle
adminSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'super_admin':
        this.permissions = [
          'manage_admins',
          'manage_users',
          'manage_drivers',
          'manage_commissions',
          'manage_payments',
          'view_all_stats',
          'block_users',
          'manage_content',
        ];
        break;
      case 'admin':
        this.permissions = [
          'view_zone_drivers',
          'verify_payments',
          'block_drivers',
          'call_drivers',
          'view_zone_stats',
          'manage_content',
        ];
        break;
    }
  }
  next();
});

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

