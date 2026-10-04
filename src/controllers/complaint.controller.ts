import { Response, NextFunction } from 'express';
import Complaint from '../models/Complaint';
import Booking from '../models/Booking';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest, SuccessResponse } from '../types';

/**
 * Controller pour la gestion des réclamations
 */

/**
 * @route   POST /api/complaints
 * @desc    Créer une réclamation
 * @access  Private
 */
export const createComplaint = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { bookingId, reason, description } = req.body;

    // Récupérer la réservation
    const booking = await Booking.findById(bookingId).populate('trip');

    if (!booking) {
      throw ApiError.notFound('Réservation non trouvée');
    }

    // Vérifier que la réservation est terminée
    if (booking.status !== 'completed') {
      throw ApiError.badRequest('Vous ne pouvez faire une réclamation que pour un trajet terminé');
    }

    // Vérifier que l'utilisateur fait partie de la réservation
    const isPassenger = booking.passenger.toString() === req.user?.id;
    const isDriver = booking.driver.toString() === req.user?.id;

    if (!isPassenger && !isDriver) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à faire une réclamation pour cette réservation');
    }

    // Déterminer qui est accusé
    const accused = isPassenger ? booking.driver : booking.passenger;
    const complainantRole = isPassenger ? 'passenger' : 'driver';

    // Vérifier qu'une réclamation n'a pas déjà été créée
    const existingComplaint = await Complaint.findOne({
      booking: bookingId,
      complainant: req.user?.id,
    });

    if (existingComplaint) {
      throw ApiError.badRequest('Vous avez déjà fait une réclamation pour cette réservation');
    }

    // Créer la réclamation
    const complaint = await Complaint.create({
      trip: booking.trip,
      booking: bookingId,
      complainant: req.user?.id,
      accused,
      complainantRole,
      reason,
      description,
      status: 'pending',
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('complainant', 'firstName lastName profilePicture')
      .populate('accused', 'firstName lastName profilePicture')
      .populate('trip', 'departure destination departureTime');

    const response: SuccessResponse = {
      success: true,
      data: populatedComplaint,
      message: 'Réclamation créée avec succès. Un administrateur la traitera prochainement.',
    };

    res.status(201).json(response);
  }
);

/**
 * @route   GET /api/complaints/my
 * @desc    Récupérer les réclamations de l'utilisateur connecté
 * @access  Private
 */
export const getMyComplaints = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const complaints = await Complaint.find({ complainant: req.user?.id })
      .populate('accused', 'firstName lastName profilePicture')
      .populate('trip', 'departure destination departureTime')
      .populate('booking')
      .sort({ createdAt: -1 });

    const response: SuccessResponse = {
      success: true,
      data: complaints,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/complaints/:id
 * @desc    Récupérer les détails d'une réclamation
 * @access  Private
 */
export const getComplaintById = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
      .populate('complainant', 'firstName lastName profilePicture phoneNumber email')
      .populate('accused', 'firstName lastName profilePicture phoneNumber email')
      .populate('trip')
      .populate('booking')
      .populate('resolvedBy', 'firstName lastName email');

    if (!complaint) {
      throw ApiError.notFound('Réclamation non trouvée');
    }

    // Vérifier que l'utilisateur est autorisé
    const isComplainant = complaint.complainant._id.toString() === req.user?.id;
    const isAccused = complaint.accused._id.toString() === req.user?.id;

    if (!isComplainant && !isAccused) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à voir cette réclamation');
    }

    const response: SuccessResponse = {
      success: true,
      data: complaint,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/complaints
 * @desc    Récupérer toutes les réclamations (Admin)
 * @access  Private (Admin)
 */
export const getAllComplaints = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { status } = req.query;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const complaints = await Complaint.find(filter)
      .populate('complainant', 'firstName lastName profilePicture phoneNumber email wilaya')
      .populate('accused', 'firstName lastName profilePicture phoneNumber email wilaya')
      .populate('trip', 'departure destination departureTime')
      .populate('booking')
      .populate('resolvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const response: SuccessResponse = {
      success: true,
      data: complaints,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   PUT /api/complaints/:id/status
 * @desc    Mettre à jour le statut d'une réclamation (Admin)
 * @access  Private (Admin)
 */
export const updateComplaintStatus = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      throw ApiError.notFound('Réclamation non trouvée');
    }

    complaint.status = status;
    if (adminNote) {
      complaint.adminNote = adminNote;
    }
    if (status === 'resolved' || status === 'rejected') {
      complaint.resolvedBy = req.admin?.id as any;
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('complainant', 'firstName lastName profilePicture phoneNumber email')
      .populate('accused', 'firstName lastName profilePicture phoneNumber email')
      .populate('trip', 'departure destination departureTime')
      .populate('booking')
      .populate('resolvedBy', 'firstName lastName email');

    const response: SuccessResponse = {
      success: true,
      data: updatedComplaint,
      message: 'Statut de la réclamation mis à jour avec succès',
    };

    res.status(200).json(response);
  }
);


