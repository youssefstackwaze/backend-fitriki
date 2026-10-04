import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createReview,
  getUserReviews,
  getMyGivenReviews,
  getMyReceivedReviews,
  getBookingReviews,
  updateReview,
  deleteReview,
} from '../controllers/review.controller';
import { createReviewValidator, updateReviewValidator } from '../validators/review.validator';

const router = express.Router();

// Routes publiques
router.get('/user/:userId', getUserReviews);

// Routes protégées
router.use(authenticate);

// Créer un avis
router.post('/', validate(createReviewValidator), createReview);

// Récupérer mes avis donnés
router.get('/my/given', getMyGivenReviews);

// Récupérer mes avis reçus
router.get('/my/received', getMyReceivedReviews);

// Récupérer les avis d'une réservation
router.get('/booking/:bookingId', getBookingReviews);

// Modifier un avis
router.put('/:id', validate(updateReviewValidator), updateReview);

// Supprimer un avis
router.delete('/:id', deleteReview);

export default router;



