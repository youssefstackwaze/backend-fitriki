import multer from 'multer';
import { ApiError } from '../utils/ApiError';

/**
 * Configuration de Multer pour l'upload de fichiers
 */

// Filtrer les types de fichiers acceptés
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Type de fichier non autorisé. Seuls les formats JPEG, PNG et WEBP sont acceptés.'));
  }
};

// Configuration du stockage en mémoire
const storage = multer.memoryStorage();

// Middleware Multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

