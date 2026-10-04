import { body } from 'express-validator';

/**
 * Validateurs pour les routes d'authentification
 */

export const signupValidator = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .trim()
    .toLowerCase(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ min: 2 })
    .withMessage('Le prénom doit contenir au moins 2 caractères'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2 })
    .withMessage('Le nom doit contenir au moins 2 caractères'),
  body('phoneNumber')
    .optional()
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Numéro de téléphone invalide'),
  body('wilaya')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Wilaya invalide'),
];

export const loginValidator = [
  body('email')
    .isEmail({ allow_utf8_local_part: false })
    .withMessage('Email invalide')
    .trim()
    .toLowerCase(),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
];

export const forgotPasswordValidator = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
];

export const verifyResetCodeValidator = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('code')
    .notEmpty()
    .withMessage('Le code est requis')
    .isLength({ min: 6, max: 6 })
    .withMessage('Le code doit contenir 6 chiffres'),
];

export const resetPasswordValidator = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('code')
    .notEmpty()
    .withMessage('Le code est requis')
    .isLength({ min: 6, max: 6 })
    .withMessage('Le code doit contenir 6 chiffres'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
];

