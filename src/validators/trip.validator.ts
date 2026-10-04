import { body, query } from 'express-validator';

/**
 * Validateurs pour les routes de trajets
 */

export const createTripValidator = [
  body('departure.city')
    .trim()
    .notEmpty()
    .withMessage('La ville de départ est requise'),
  body('departure.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude de départ invalide'),
  body('departure.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude de départ invalide'),
  body('destination.city')
    .trim()
    .notEmpty()
    .withMessage('La ville de destination est requise'),
  body('destination.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude de destination invalide'),
  body('destination.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude de destination invalide'),
  body('departureTime')
    .isISO8601()
    .withMessage('Date de départ invalide')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('La date de départ doit être dans le futur');
      }
      return true;
    }),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être positif'),
  body('priceType')
    .optional()
    .isIn(['fixed', 'negotiable'])
    .withMessage('Le type de prix doit être "fixed" ou "negotiable"'),
  body('availableSeats')
    .isInt({ min: 1, max: 8 })
    .withMessage('Le nombre de places doit être entre 1 et 8'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères'),
];

export const updateTripValidator = [
  body('departureTime')
    .optional()
    .isISO8601()
    .withMessage('Date de départ invalide'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être positif'),
  body('priceType')
    .optional()
    .isIn(['fixed', 'negotiable'])
    .withMessage('Le type de prix doit être "fixed" ou "negotiable"'),
  body('availableSeats')
    .optional()
    .isInt({ min: 0, max: 8 })
    .withMessage('Le nombre de places doit être entre 0 et 8'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères'),
];

export const searchTripsValidator = [
  query('departureCity')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La ville de départ ne peut pas être vide'),
  query('destinationCity')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La ville de destination ne peut pas être vide'),
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date invalide'),
  query('minSeats')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le nombre de places minimum doit être positif'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix maximum doit être positif'),
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude invalide'),
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude invalide'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Le rayon doit être entre 1 et 200 km'),
];

