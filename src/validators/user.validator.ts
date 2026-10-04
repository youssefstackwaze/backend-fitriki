import { body } from 'express-validator';

/**
 * Validateurs pour les routes utilisateur
 */

export const updateProfileValidator = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Le prénom doit contenir au moins 2 caractères'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Le nom doit contenir au moins 2 caractères'),
  body('phoneNumber')
    .optional({ values: 'falsy' })
    .custom((value) => {
      if (value && !value.match(/^[0-9]{8,15}$/)) {
        throw new Error('Numéro de téléphone invalide (8-15 chiffres requis)');
      }
      return true;
    }),
  body('bio')
    .optional({ values: 'falsy' })
    .isLength({ max: 500 })
    .withMessage('La bio ne peut pas dépasser 500 caractères'),
  body('cin')
    .optional({ values: 'falsy' })
    .trim(),
  body('driverLicenseNumber')
    .optional({ values: 'falsy' })
    .trim(),
  body('vehicle.brand')
    .optional({ values: 'falsy' })
    .trim(),
  body('vehicle.model')
    .optional({ values: 'falsy' })
    .trim(),
  body('vehicle.year')
    .optional({ values: 'falsy' })
    .custom((value) => {
      if (value && (value < 1900 || value > new Date().getFullYear() + 1)) {
        throw new Error('Année du véhicule invalide');
      }
      return true;
    }),
  body('vehicle.color')
    .optional({ values: 'falsy' })
    .trim(),
  body('vehicle.licensePlate')
    .optional({ values: 'falsy' })
    .trim(),
];

