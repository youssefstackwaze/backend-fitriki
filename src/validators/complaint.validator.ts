import { body, param } from 'express-validator';

export const createComplaintValidator = [
  body('bookingId')
    .notEmpty()
    .withMessage('L\'ID de la réservation est requis')
    .isMongoId()
    .withMessage('ID de réservation invalide'),
  body('reason')
    .notEmpty()
    .withMessage('La raison de la réclamation est requise')
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('La raison doit contenir entre 3 et 200 caractères'),
  body('description')
    .notEmpty()
    .withMessage('La description de la réclamation est requise')
    .isString()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La description doit contenir entre 10 et 2000 caractères'),
];

export const updateComplaintStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID de réclamation invalide'),
  body('status')
    .notEmpty()
    .withMessage('Le statut est requis')
    .isIn(['pending', 'investigating', 'resolved', 'rejected'])
    .withMessage('Statut invalide'),
  body('adminNote')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La note administrative ne peut pas dépasser 2000 caractères'),
];



