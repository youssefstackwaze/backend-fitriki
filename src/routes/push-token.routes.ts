import { Router } from 'express';
import { savePushToken, deletePushToken } from '../controllers/push-token.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Routes pour la gestion des push tokens
 */

// Enregistrer un push token
router.post('/', authenticate, savePushToken);

// Supprimer un push token
router.delete('/:token', authenticate, deletePushToken);

export default router;

