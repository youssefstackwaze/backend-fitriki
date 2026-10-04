import { body } from 'express-validator';

/**
 * Validateurs pour les routes de réservations
 */

export const createBookingValidator = [
  body('tripId')
    .notEmpty()
    .withMessage('L\'ID du trajet est requis')
    .isMongoId()
    .withMessage('ID de trajet invalide'),
  body('seats')
    .isInt({ min: 1, max: 8 })
    .withMessage('Le nombre de places doit être entre 1 et 8'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Le message ne peut pas dépasser 500 caractères'),
];

export const updateBookingStatusValidator = [
  body('status')
    .isIn(['confirmed', 'cancelled'])
    .withMessage('Statut invalide. Valeurs autorisées: confirmed, cancelled'),
  body('cancellationReason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La raison d\'annulation ne peut pas dépasser 500 caractères'),
];

export const createReviewValidator = [
  body('bookingId')
    .notEmpty()
    .withMessage('L\'ID de la réservation est requis')
    .isMongoId()
    .withMessage('ID de réservation invalide'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La note doit être entre 1 et 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Le commentaire ne peut pas dépasser 1000 caractères'),
];

