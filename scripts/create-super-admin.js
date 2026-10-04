#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

// Script pour créer le premier Super Admin
// Usage: node scripts/create-super-admin.js

const AdminSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  role: String,
  isBlocked: Boolean,
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

async function createSuperAdmin() {
  try {
    // Connexion à MongoDB
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/covoiturage';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si un Super Admin existe déjà
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Un Super Admin existe déjà:', existingSuperAdmin.email);
      console.log('Vous pouvez modifier ce script pour créer des admins supplémentaires.');
      process.exit(0);
    }

    // Créer le Super Admin
    const superAdmin = new Admin({
      email: 'admin@covoiturage.dz',
      password: 'Admin@123456', // Changez ce mot de passe !
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      isBlocked: false,
    });

    await superAdmin.save();
    console.log('✅ Super Admin créé avec succès !');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔐 Mot de passe: Admin@123456');
    console.log('⚠️  CHANGEZ CE MOT DE PASSE après la première connexion !');

  } catch (error) {
    console.error('❌ Erreur lors de la création du Super Admin:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createSuperAdmin();

