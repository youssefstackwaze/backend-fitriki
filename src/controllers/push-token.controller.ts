import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest, SuccessResponse } from '../types';
import { registerPushToken, unregisterPushToken } from '../services/notification.service';

/**
 * Controller pour la gestion des push tokens
 */

/**
 * @route   POST /api/push-tokens
 * @desc    Enregistrer un push token pour recevoir des notifications
 * @access  Private
 */
export const savePushToken = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { token, deviceType } = req.body;
    const userId = req.user?.id;

    if (!token) {
      throw ApiError.badRequest('Le token est requis');
    }

    if (!deviceType || !['ios', 'android', 'web'].includes(deviceType)) {
      throw ApiError.badRequest('Le type d\'appareil doit être: ios, android ou web');
    }

    await registerPushToken(userId!, token, deviceType);

    const response: SuccessResponse = {
      success: true,
      data: { token, deviceType },
      message: 'Token push enregistré avec succès',
    };

    res.status(200).json(response);
  }
);

/**
 * @route   DELETE /api/push-tokens/:token
 * @desc    Supprimer un push token (lors de la déconnexion)
 * @access  Private
 */
export const deletePushToken = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { token } = req.params;

    if (!token) {
      throw ApiError.badRequest('Le token est requis');
    }

    await unregisterPushToken(token);

    const response: SuccessResponse = {
      success: true,
      data: { token },
      message: 'Token push supprimé avec succès',
    };

    res.status(200).json(response);
  }
);

