import { Router } from 'express';
import {
  createTrip,
  createRecurringTrips,
  searchTrips,
  getTripById,
  updateTrip,
  cancelTrip,
  completeTrip,
  getMyTrips,
  getDriverStats,
} from '../controllers/trip.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createTripValidator,
  updateTripValidator,
  searchTripsValidator,
} from '../validators/trip.validator';

const router = Router();

/**
 * Routes pour les trajets
 */

// Créer un nouveau trajet
router.post('/', authenticate, createTrip);

// Créer des trajets récurrents
router.post('/recurring', authenticate, createRecurringTrips);

// Rechercher des trajets
router.get('/search', validate(searchTripsValidator), searchTrips);

// Récupérer les trajets de l'utilisateur connecté
router.get('/my/trips', authenticate, getMyTrips);

// Récupérer les statistiques du conducteur
router.get('/my/stats', authenticate, getDriverStats);

// Récupérer un trajet par ID
router.get('/:id', optionalAuthenticate, getTripById);

// Mettre à jour un trajet
router.put('/:id', authenticate, validate(updateTripValidator), updateTrip);

// Annuler un trajet
router.delete('/:id', authenticate, cancelTrip);

// Marquer un trajet comme terminé
router.put('/:id/complete', authenticate, completeTrip);

export default router;

