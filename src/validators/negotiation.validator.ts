import { body, param } from 'express-validator';

export const createNegotiationValidator = [
  body('tripId')
    .notEmpty()
    .withMessage('L\'ID du trajet est requis')
    .isMongoId()
    .withMessage('ID de trajet invalide'),
  body('proposedPrice')
    .isFloat({ min: 0 })
    .withMessage('Le prix proposé doit être un nombre positif'),
  body('message')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Le message ne peut pas dépasser 500 caractères'),
];

export const counterOfferValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID de négociation invalide'),
  body('counterPrice')
    .isFloat({ min: 0 })
    .withMessage('Le contre-prix doit être un nombre positif'),
  body('message')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Le message ne peut pas dépasser 500 caractères'),
];

export const negotiationMessageValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID de négociation invalide'),
  body('message')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Le message ne peut pas dépasser 500 caractères'),
];


