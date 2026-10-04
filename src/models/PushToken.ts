import mongoose, { Schema, Document } from 'mongoose';

export interface IPushToken extends Document {
  user: mongoose.Types.ObjectId;
  token: string;
  deviceType: 'ios' | 'android' | 'web';
  createdAt: Date;
  updatedAt: Date;
}

const PushTokenSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    deviceType: {
      type: String,
      enum: ['ios', 'android', 'web'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour rechercher rapidement tous les tokens d'un utilisateur
PushTokenSchema.index({ user: 1, token: 1 });

export default mongoose.model<IPushToken>('PushToken', PushTokenSchema);

