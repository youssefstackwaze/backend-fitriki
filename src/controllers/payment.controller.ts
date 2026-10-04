import { Response, NextFunction } from 'express';
import { Payment } from '../models/payment.model';
import User from '../models/User';
import Trip from '../models/Trip';
import Booking from '../models/Booking';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest, SuccessResponse } from '../types/index';
import { getCommissionRate } from '../config/constants';

/**
 * @route   GET /api/admin/payments/drivers/:driverId
 * @desc    Obtenir les paiements pour un conducteur spécifique
 * @access  Private (Admin, Super Admin)
 */
export const getDriverPayments = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { driverId } = req.params;

    const driver = await User.findById(driverId);
    if (!driver || (driver.role !== 'driver' && driver.role !== 'both')) {
      throw ApiError.notFound('Conducteur non trouvé');
    }

    const payments = await Payment.find({ driver: driverId }).sort({ 'period.year': -1, 'period.month': -1 });

    const response: SuccessResponse = {
      success: true,
      data: payments,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/admin/payments/pending
 * @desc    Obtenir tous les paiements en attente
 * @access  Private (Admin, Super Admin)
 */
export const getAllPendingPayments = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const pendingPayments = await Payment.find({ status: 'pending' })
      .populate('driver', 'firstName lastName email phoneNumber')
      .sort({ createdAt: 1 });

    const response: SuccessResponse = {
      success: true,
      data: pendingPayments,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   PUT /api/admin/payments/:id/status
 * @desc    Mettre à jour le statut d'un paiement
 * @access  Private (Admin, Super Admin)
 */
export const updatePaymentStatus = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      throw ApiError.notFound('Paiement non trouvé');
    }

    if (!['paid', 'cancelled'].includes(status)) {
      throw ApiError.badRequest('Statut de paiement invalide');
    }

    payment.status = status;
    payment.paidDate = status === 'paid' ? new Date() : undefined;
    payment.transactionReference = status === 'paid' ? transactionId : undefined;
    payment.verifiedBy = req.admin?.id as any;

    await payment.save();

    const response: SuccessResponse = {
      success: true,
      message: `Statut du paiement mis à jour à ${status}`,
      data: payment,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   POST /api/admin/payments/generate-monthly
 * @desc    Générer les paiements mensuels pour tous les conducteurs
 * @access  Private (Super Admin)
 */
export const generateMonthlyPayments = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { month, year } = req.body;

    if (!month || !year) {
      throw ApiError.badRequest('Veuillez spécifier le mois et l\'année');
    }

    // Trouver tous les conducteurs actifs
    const drivers = await User.find({ 
      role: { $in: ['driver', 'both'] }, 
      isBlocked: false 
    });

    const generatedPayments = [];

    // Récupérer le taux de commission dynamique
    const commissionRate = await getCommissionRate();

    for (const driver of drivers) {
      // Calculer le total des commissions pour ce conducteur
      const trips = await Trip.find({
        driver: driver._id,
        status: 'completed',
        departureTime: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1),
        },
      });

      let totalCommission = 0;
      for (const trip of trips) {
        const bookings = await Booking.find({ 
          trip: trip._id, 
          status: 'confirmed' 
        });
        
        for (const booking of bookings) {
          totalCommission += booking.totalPrice * commissionRate;
        }
      }

      if (totalCommission > 0) {
        const existingPayment = await Payment.findOne({ 
          driver: driver._id, 
          'period.month': month,
          'period.year': year,
        });

        if (!existingPayment) {
          const payment = await Payment.create({
            driver: driver._id,
            amount: totalCommission,
            period: { month, year },
            dueDate: new Date(year, month, 5), // Date limite: 5 du mois suivant
            totalEarnings: totalCommission / commissionRate,
            commissionRate: commissionRate * 100,
            trips: trips.map(t => t._id),
            status: 'pending',
          });
          generatedPayments.push(payment);
        }
      }
    }

    const response: SuccessResponse = {
      success: true,
      message: `${generatedPayments.length} paiements générés`,
      data: generatedPayments,
    };

    res.status(200).json(response);
  }
);
