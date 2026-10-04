import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest, SuccessResponse } from '../types/index';
import { CommissionSettings } from '../models/CommissionSettings';

/**
 * @route   GET /api/admin/commission
 * @desc    Obtenir le taux de commission actuel
 * @access  Private (tous les admins)
 */
export const getCommissionRate = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const settings = await CommissionSettings.findOne();
    const rate = settings ? settings.rate : 0.16; // 16% par défaut si pas de settings

    const response: SuccessResponse = {
      success: true,
      data: { rate },
    };
    res.status(200).json(response);
  }
);

/**
 * @route   PUT /api/admin/commission
 * @desc    Mettre à jour le taux de commission (Super Admin seulement)
 * @access  Private (Super Admin)
 */
export const updateCommissionRate = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { rate } = req.body;
    const adminId = req.admin?.id;

    if (typeof rate !== 'number' || rate < 0 || rate >= 1) {
      throw ApiError.badRequest('Le taux de commission doit être un nombre entre 0 et 0.99');
    }

    // Mettre à jour ou créer les paramètres
    let settings = await CommissionSettings.findOne();
    
    if (!settings) {
      // Créer le document si il n'existe pas
      settings = await CommissionSettings.create({
        rate,
        updatedBy: adminId,
      });
    } else {
      // Mettre à jour le document existant
      settings.rate = rate;
      settings.updatedBy = adminId as any;
      await settings.save();
    }

    const response: SuccessResponse = {
      success: true,
      message: 'Taux de commission mis à jour avec succès',
      data: { rate: settings.rate },
    };
    res.status(200).json(response);
  }
);
