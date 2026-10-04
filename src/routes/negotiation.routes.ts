import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createNegotiation,
  counterOffer,
  acceptNegotiation,
  rejectNegotiation,
  getTripNegotiations,
  getMyNegotiations,
  getNegotiationById,
} from '../controllers/negotiation.controller';
import {
  createNegotiationValidator,
  counterOfferValidator,
  negotiationMessageValidator,
} from '../validators/negotiation.validator';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Créer une nouvelle négociation
router.post('/', validate(createNegotiationValidator), createNegotiation);

// Faire une contre-proposition
router.post('/:id/counter', validate(counterOfferValidator), counterOffer);

// Accepter une négociation
router.post('/:id/accept', validate(negotiationMessageValidator), acceptNegotiation);

// Rejeter une négociation
router.post('/:id/reject', validate(negotiationMessageValidator), rejectNegotiation);

// Récupérer les négociations d'un trajet (conducteur)
router.get('/trip/:tripId', getTripNegotiations);

// Récupérer mes négociations
router.get('/my', getMyNegotiations);

// Récupérer une négociation spécifique
router.get('/:id', getNegotiationById);

export default router;


