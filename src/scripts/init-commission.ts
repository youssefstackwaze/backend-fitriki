import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CommissionSettings } from '../models/CommissionSettings';

// Charger les variables d'environnement
dotenv.config();

/**
 * Script pour initialiser les paramètres de commission dans la base de données
 */
async function initCommission() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/covoiturage';
    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si les paramètres existent déjà
    const existingSettings = await CommissionSettings.findOne();

    if (existingSettings) {
      console.log('✅ Les paramètres de commission existent déjà');
      console.log(`📊 Taux actuel: ${(existingSettings.rate * 100).toFixed(1)}%`);
    } else {
      // Créer les paramètres par défaut
      console.log('📝 Création des paramètres de commission par défaut...');
      const settings = await CommissionSettings.create({
        rate: 0.16, // 16% par défaut
      });
      console.log('✅ Paramètres créés avec succès');
      console.log(`📊 Taux par défaut: ${(settings.rate * 100).toFixed(1)}%`);
    }

    // Fermer la connexion
    await mongoose.connection.close();
    console.log('✅ Script terminé');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
initCommission();

