import { body, param } from 'express-validator';

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
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Le commentaire ne peut pas dépasser 1000 caractères'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous doit être un booléen'),
];

export const updateReviewValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID d\'avis invalide'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La note doit être entre 1 et 5'),
  body('comment')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Le commentaire ne peut pas dépasser 1000 caractères'),
];



