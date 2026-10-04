import { Router } from 'express';
import {
  signup,
  login,
  getMe,
  logout,
  sendEmailVerification,
  verifyEmail,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
} from '../validators/auth.validator';

const router = Router();

/**
 * Routes d'authentification
 */

// Inscription avec email
router.post('/signup', validate(signupValidator), signup);

// Connexion avec email
router.post('/login', validate(loginValidator), login);

// Récupérer le profil de l'utilisateur connecté
router.get('/me', authenticate, getMe);

// Déconnexion
router.post('/logout', authenticate, logout);

// Vérification email
router.post('/send-email-verification', authenticate, sendEmailVerification);
router.post('/verify-email', authenticate, verifyEmail);

// Réinitialisation du mot de passe
router.post('/forgot-password', validate(forgotPasswordValidator), forgotPassword);
router.post('/verify-reset-code', validate(verifyResetCodeValidator), verifyResetCode);
router.post('/reset-password', validate(resetPasswordValidator), resetPassword);

export default router;

