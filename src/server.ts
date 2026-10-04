import dotenv from 'dotenv';
import createApp from './app';
import connectDatabase from './config/database';

// Charger les variables d'environnement
dotenv.config();

/**
 * Démarrage du serveur
 */
const startServer = async () => {
  try {
    // Connexion à la base de données
    await connectDatabase();

    // Créer l'application Express
    const app = createApp();

    // Port du serveur
    const PORT = parseInt(process.env.PORT || '3000', 10);

    // Démarrer le serveur sur toutes les interfaces (0.0.0.0)
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('🚗 ====================================== 🚗');
      console.log(`   🚀 Serveur démarré avec succès !`);
      console.log(`   📡 Port: ${PORT}`);
      console.log(`   🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   📝 API Local: http://localhost:${PORT}/api`);
      console.log(`   📱 API Wi-Fi: http://192.168.1.14:${PORT}/api`);
      console.log(`   ❤️  Health: http://localhost:${PORT}/health`);
      console.log('🚗 ====================================== 🚗');
      console.log('');
    });

    // Gestion de l'arrêt gracieux
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⚠️  Signal ${signal} reçu. Arrêt du serveur...`);
      
      server.close(async () => {
        console.log('🔒 Serveur HTTP fermé');
        
        try {
          // Fermer la connexion MongoDB
          const mongoose = await import('mongoose');
          await mongoose.default.connection.close();
          console.log('🔒 Connexion MongoDB fermée');
          
          console.log('✅ Arrêt gracieux terminé');
          process.exit(0);
        } catch (error) {
          console.error('❌ Erreur lors de l\'arrêt:', error);
          process.exit(1);
        }
      });

      // Forcer l'arrêt après 10 secondes
      setTimeout(() => {
        console.error('⚠️  Arrêt forcé après timeout');
        process.exit(1);
      }, 10000);
    };

    // Écouter les signaux d'arrêt
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Gestion des erreurs non gérées
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      // Ne pas arrêter le serveur en production
      if (process.env.NODE_ENV === 'development') {
        gracefulShutdown('unhandledRejection');
      }
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

  } catch (error) {
    console.error('❌ Erreur fatale lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();

