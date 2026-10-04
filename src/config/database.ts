import mongoose from 'mongoose';

/**
 * Configuration et connexion à MongoDB
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI n\'est pas défini dans les variables d\'environnement. Vérifiez votre fichier .env');
    }
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connecté à MongoDB avec succès');
    
    // Gestion des événements de connexion
    mongoose.connection.on('error', (error) => {
      console.error('❌ Erreur de connexion MongoDB:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  Déconnecté de MongoDB');
    });
    
    // Gestion de la fermeture gracieuse
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 Connexion MongoDB fermée suite à l\'arrêt de l\'application');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
};

export default connectDatabase;

