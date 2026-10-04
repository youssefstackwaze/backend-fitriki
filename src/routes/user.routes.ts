import { Router } from 'express';
import {
  getUserProfile,
  updateProfile,
  uploadProfilePicture,
  getUserTrips,
  getUserReviews,
  deleteAccount,
} from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { updateProfileValidator } from '../validators/user.validator';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

/**
 * Routes utilisateur
 */

// Récupérer le profil d'un utilisateur
router.get('/:id', getUserProfile);

// Mettre à jour le profil (utilisateur connecté)
router.put('/profile', authenticate,updateProfile);

// Upload photo de profil
router.post(
  '/profile-picture',
  authenticate,
  upload.single('profilePicture'),
  uploadProfilePicture
);

// Récupérer les trajets d'un utilisateur
router.get('/:id/trips', getUserTrips);

// Récupérer les avis d'un utilisateur
router.get('/:id/reviews', getUserReviews);

// Supprimer le compte
router.delete('/account', authenticate, deleteAccount);

export default router;

