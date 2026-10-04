import { Response, NextFunction } from 'express';
import Review from '../models/Review';
import Booking from '../models/Booking';
import Trip from '../models/Trip';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest, SuccessResponse } from '../types';

/**
 * Controller pour la gestion des avis
 */

/**
 * @route   POST /api/reviews
 * @desc    Créer un avis (passager note le conducteur ou conducteur note le passager)
 * @access  Private
 */
export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { bookingId, rating, comment, isAnonymous } = req.body;
    const userId = req.user?.id;

    // Vérifier que la réservation existe
    const booking = await Booking.findById(bookingId)
      .populate('trip')
      .populate('passenger')
      .populate('driver');

    if (!booking) {
      throw ApiError.notFound('Réservation non trouvée');
    }

    // Vérifier que la réservation est terminée
    if (booking.status !== 'completed') {
      throw ApiError.badRequest('Vous ne pouvez laisser un avis que pour un trajet terminé');
    }

    // Récupérer le trajet complet
    const trip = await Trip.findById(booking.trip);
    if (!trip) {
      throw ApiError.notFound('Trajet non trouvé');
    }

    // Déterminer le rôle de l'utilisateur et qui il évalue
    // booking.passenger et booking.driver sont des objets populés, il faut utiliser ._id
    const passengerId = (booking.passenger as any)._id?.toString() || booking.passenger.toString();
    const driverId = (booking.driver as any)._id?.toString() || booking.driver.toString();
    const tripDriverId = trip.driver.toString();
    
    const isPassenger = passengerId === userId;
    const isDriver = driverId === userId || tripDriverId === userId;

    if (!isPassenger && !isDriver) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à laisser un avis pour cette réservation');
    }

    const reviewerRole = isPassenger ? 'passenger' : 'driver';
    const revieweeId = isPassenger ? tripDriverId : passengerId;

    // Vérifier qu'un avis n'existe pas déjà
    const existingReview = await Review.findOne({
      booking: bookingId,
      reviewer: userId,
    });

    if (existingReview) {
      throw ApiError.badRequest('Vous avez déjà laissé un avis pour cette réservation');
    }

    // Créer l'avis
    const review = await Review.create({
      trip: booking.trip,
      booking: bookingId,
      reviewer: userId,
      reviewee: revieweeId,
      rating,
      comment,
      reviewerRole,
      isAnonymous: isAnonymous || false,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('reviewee', 'firstName lastName profilePicture rating totalRatings')
      .populate('trip', 'departure destination departureTime')
      .populate('booking');

    const response: SuccessResponse = {
      success: true,
      data: populatedReview,
      message: 'Avis enregistré avec succès',
    };

    res.status(201).json(response);
  }
);

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Récupérer tous les avis reçus par un utilisateur
 * @access  Public
 */
export const getUserReviews = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { userId } = req.params;
    const { role } = req.query; // 'driver' ou 'passenger'

    const filter: any = { reviewee: userId };
    
    if (role) {
      filter.reviewerRole = role === 'driver' ? 'passenger' : 'driver';
    }

    const reviews = await Review.find(filter)
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('trip', 'departure destination departureTime')
      .sort({ createdAt: -1 });

    const response: SuccessResponse = {
      success: true,
      data: reviews,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/reviews/my/given
 * @desc    Récupérer tous les avis que j'ai donnés
 * @access  Private
 */
export const getMyGivenReviews = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    const reviews = await Review.find({ reviewer: userId })
      .populate('reviewee', 'firstName lastName profilePicture')
      .populate('trip', 'departure destination departureTime')
      .populate('booking')
      .sort({ createdAt: -1 });

    const response: SuccessResponse = {
      success: true,
      data: reviews,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/reviews/my/received
 * @desc    Récupérer tous les avis que j'ai reçus
 * @access  Private
 */
export const getMyReceivedReviews = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('trip', 'departure destination departureTime')
      .sort({ createdAt: -1 });

    const response: SuccessResponse = {
      success: true,
      data: reviews,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/reviews/booking/:bookingId
 * @desc    Récupérer les avis d'une réservation
 * @access  Private
 */
export const getBookingReviews = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { bookingId } = req.params;

    const reviews = await Review.find({ booking: bookingId })
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('reviewee', 'firstName lastName profilePicture rating')
      .sort({ createdAt: -1 });

    const response: SuccessResponse = {
      success: true,
      data: reviews,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Modifier un avis
 * @access  Private
 */
export const updateReview = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    const review = await Review.findById(id);

    if (!review) {
      throw ApiError.notFound('Avis non trouvé');
    }

    // Vérifier que l'utilisateur est l'auteur de l'avis
    if (review.reviewer.toString() !== userId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à modifier cet avis');
    }

    // Mettre à jour l'avis
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('reviewee', 'firstName lastName profilePicture rating totalRatings');

    const response: SuccessResponse = {
      success: true,
      data: updatedReview,
      message: 'Avis modifié avec succès',
    };

    res.status(200).json(response);
  }
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Supprimer un avis
 * @access  Private
 */
export const deleteReview = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const review = await Review.findById(id);

    if (!review) {
      throw ApiError.notFound('Avis non trouvé');
    }

    // Vérifier que l'utilisateur est l'auteur de l'avis
    if (review.reviewer.toString() !== userId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à supprimer cet avis');
    }

    await review.deleteOne();

    const response: SuccessResponse = {
      success: true,
      data: null,
      message: 'Avis supprimé avec succès',
    };

    res.status(200).json(response);
  }
);



