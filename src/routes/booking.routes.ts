import { Router } from 'express';
import {
  createBooking,
  getBookingById,
  getMyBookings,
  getTripBookings,
  updateBookingStatus,
  createReview,
  cancelBookingWithLocation,
  confirmBooking,
} from '../controllers/booking.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createBookingValidator,
  updateBookingStatusValidator,
  createReviewValidator,
} from '../validators/booking.validator';

const router = Router();

/**
 * Routes pour les réservations et avis
 */

// Créer une nouvelle réservation
router.post('/', authenticate, validate(createBookingValidator), createBooking);

// Récupérer les réservations de l'utilisateur connecté
router.get('/my/bookings', authenticate, getMyBookings);

// Récupérer les réservations d'un trajet
router.get('/trip/:tripId', authenticate, getTripBookings);

// Récupérer une réservation par ID
router.get('/:id', authenticate, getBookingById);

// Mettre à jour le statut d'une réservation
router.put('/:id/status', authenticate, validate(updateBookingStatusValidator), updateBookingStatus);

// Confirmer une réservation (conducteur)
router.put('/:id/confirm', authenticate, confirmBooking);

// Annuler une réservation avec vérification géolocalisation
router.post('/:id/cancel-with-location', authenticate, cancelBookingWithLocation);

// Créer un avis pour une réservation
router.post('/:id/review', authenticate, validate(createReviewValidator), createReview);

export default router;

