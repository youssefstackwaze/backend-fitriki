#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

// Script pour réinitialiser le Super Admin
// Usage: node scripts/reset-super-admin.js

const AdminSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phoneNumber: String,
  role: String,
  isBlocked: Boolean,
  isActive: Boolean,
  lastLogin: Date,
}, { timestamps: true });

const bcrypt = require('bcryptjs');

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Admin = mongoose.model('Admin', AdminSchema);

async function resetSuperAdmin() {
  try {
    // Connexion à MongoDB
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/covoiturage';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Supprimer tous les admins existants
    const result = await Admin.deleteMany({});
    console.log(`🗑️  ${result.deletedCount} admin(s) supprimé(s)`);

    // Créer le nouveau Super Admin
    const superAdmin = new Admin({
      email: 'admin@covoiturage.dz',
      password: 'Admin@123456',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      isBlocked: false,
      isActive: true,
    });

    await superAdmin.save();
    console.log('✅ Super Admin créé avec succès !');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔐 Mot de passe: Admin@123456');
    console.log('⚠️  CHANGEZ CE MOT DE PASSE après la première connexion !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

resetSuperAdmin();

