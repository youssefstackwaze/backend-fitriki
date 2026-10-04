import mongoose, { Document, Schema } from 'mongoose';

export interface ICommissionSettings extends Document {
  rate: number;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const CommissionSettingsSchema = new Schema<ICommissionSettings>(
  {
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 0.99,
      default: 0.16, // 16% par défaut
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Il ne doit y avoir qu'un seul document de configuration
// On utilise un ID fixe pour s'assurer de cela
CommissionSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    // Créer les paramètres par défaut si ils n'existent pas
    settings = await this.create({ rate: 0.16 });
  }
  return settings;
};

CommissionSettingsSchema.statics.updateRate = async function (rate: number, adminId?: string) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ rate, updatedBy: adminId });
  } else {
    settings.rate = rate;
    settings.updatedBy = adminId as any;
    await settings.save();
  }
  return settings;
};

export const CommissionSettings = mongoose.model<ICommissionSettings>('CommissionSettings', CommissionSettingsSchema);

