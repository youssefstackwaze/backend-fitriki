import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);
/**
 * Configuration de Cloudinary pour l'upload d'images
 * Note: dotenv doit être chargé AVANT d'importer ce module
 */

// Fonction pour configurer Cloudinary avec vérification
const configureCloudinary = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  // Log pour debug (sans afficher les secrets complets)
  console.log('🔧 Configuration Cloudinary:', {
    cloud_name: config.cloud_name ? '✅' : '❌',
    api_key: config.api_key ? `✅ (${config.api_key.substring(0, 5)}...)` : '❌',
    api_secret: config.api_secret ? '✅ (****)' : '❌',
  });

  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.warn('⚠️  Cloudinary n\'est pas complètement configuré. Upload d\'images désactivé.');
  }

  cloudinary.config(config);
  return cloudinary;
};

// Configurer au moment de l'import
configureCloudinary();

export default cloudinary;

