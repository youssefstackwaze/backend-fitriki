import { Response, NextFunction } from 'express';
import Negotiation from '../models/Negotiation';
import Trip from '../models/Trip';
import Booking from '../models/Booking';
import User from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest, SuccessResponse } from '../types';
import { calculateCommission, calculateDriverAmount } from '../config/constants';
import { notifyDriverNewNegotiation, notifyCounterOffer, notifyNegotiationAccepted, notifyNegotiationRejected } from '../services/notification.service';

/**
 * Controller pour la gestion des négociations de prix
 */

/**
 * @route   POST /api/negotiations
 * @desc    Créer une nouvelle négociation (proposition initiale du passager)
 * @access  Private
 */
export const createNegotiation = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { tripId, proposedPrice, message } = req.body;
    const passengerId = req.user?.id;

    // Vérifier que le trajet existe
    const trip = await Trip.findById(tripId).populate('driver');
    if (!trip) {
      throw ApiError.notFound('Trajet non trouvé');
    }

    // Vérifier que le trajet est négociable
    if (trip.priceType !== 'negotiable') {
      throw ApiError.badRequest('Ce trajet n\'a pas un prix négociable');
    }

    // Vérifier que le passager n'est pas le conducteur
    if (trip.driver._id.toString() === passengerId) {
      throw ApiError.badRequest('Vous ne pouvez pas négocier votre propre trajet');
    }

    // Vérifier qu'il n'y a pas déjà une négociation en cours
    const existingNegotiation = await Negotiation.findOne({
      trip: tripId,
      passenger: passengerId,
      status: 'pending',
    });

    if (existingNegotiation) {
      throw ApiError.badRequest('Vous avez déjà une négociation en cours pour ce trajet');
    }

    // Créer la négociation
    const negotiation = await Negotiation.create({
      trip: tripId,
      passenger: passengerId,
      driver: trip.driver._id,
      originalPrice: trip.price,
      currentOffer: proposedPrice,
      lastOfferBy: 'passenger',
      status: 'pending',
      messages: [
        {
          sender: passengerId,
          senderType: 'passenger',
          message: message || `Je propose ${proposedPrice} DA pour ce trajet.`,
          priceOffer: proposedPrice,
          createdAt: new Date(),
        },
      ],
    });

    const populatedNegotiation = await Negotiation.findById(negotiation._id)
      .populate('passenger', 'firstName lastName profilePicture')
      .populate('driver', 'firstName lastName profilePicture')
      .populate('trip', 'departure destination departureTime price');

    // 📱 Envoyer une notification push au conducteur
    try {
      const passenger = await User.findById(passengerId);
      const passengerName = passenger ? `${passenger.firstName} ${passenger.lastName}` : 'Un passager';
      const tripDetails = `${trip.departure.city} → ${trip.destination.city}`;
      
      await notifyDriverNewNegotiation(
        trip.driver._id,
        passengerName,
        tripDetails,
        proposedPrice,
        tripId, // Ajouter le tripId
        negotiation._id as any // Ajouter le negotiationId
      );
      console.log(`📱 Notification d'offre envoyée au conducteur ${trip.driver._id}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', error);
    }

    const response: SuccessResponse = {
      success: true,
      data: populatedNegotiation,
      message: 'Proposition envoyée au conducteur',
    };

    res.status(201).json(response);
  }
);

/**
 * @route   POST /api/negotiations/:id/counter
 * @desc    Faire une contre-proposition (conducteur ou passager)
 * @access  Private
 */
export const counterOffer = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { counterPrice, message } = req.body;
    const userId = req.user?.id;

    const negotiation = await Negotiation.findById(id);
    if (!negotiation) {
      throw ApiError.notFound('Négociation non trouvée');
    }

    // Vérifier que l'utilisateur est impliqué dans la négociation
    const isDriver = negotiation.driver.toString() === userId;
    const isPassenger = negotiation.passenger.toString() === userId;

    if (!isDriver && !isPassenger) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à accéder à cette négociation');
    }

    // Vérifier que la négociation est en cours
    if (negotiation.status !== 'pending') {
      throw ApiError.badRequest('Cette négociation n\'est plus active');
    }

    // Ajouter le message de contre-proposition
    const senderType = isDriver ? 'driver' : 'passenger';
    negotiation.messages.push({
      sender: userId as any,
      senderType,
      message: message || `Je propose ${counterPrice} DA.`,
      priceOffer: counterPrice,
      createdAt: new Date(),
    });

    negotiation.currentOffer = counterPrice;
    negotiation.lastOfferBy = senderType;

    await negotiation.save();

    const populatedNegotiation = await Negotiation.findById(negotiation._id)
      .populate('passenger', 'firstName lastName profilePicture')
      .populate('driver', 'firstName lastName profilePicture')
      .populate('trip', 'departure destination departureTime price');

    // 📱 Envoyer une notification push à l'autre partie
    try {
      if (populatedNegotiation) {
        const recipientId = isDriver ? negotiation.passenger : negotiation.driver;
        const sender = await User.findById(userId);
        const senderName = sender ? `${sender.firstName} ${sender.lastName}` : (isDriver ? 'Le conducteur' : 'Le passager');
        const trip = populatedNegotiation.trip as any;
        const tripDetails = `${trip.departure.city} → ${trip.destination.city}`;
        
        await notifyCounterOffer(
          recipientId,
          senderName,
          tripDetails,
          counterPrice,
          negotiation._id as any, // Ajouter le negotiationId
          negotiation.trip // Ajouter le tripId
        );
        console.log(`📱 Notification de contre-offre envoyée à ${recipientId}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', error);
    }

    const response: SuccessResponse = {
      success: true,
      data: populatedNegotiation,
      message: 'Contre-proposition envoyée',
    };

    res.status(200).json(response);
  }
);

/**
 * @route   POST /api/negotiations/:id/accept
 * @desc    Accepter une négociation
 * @access  Private
 */
export const acceptNegotiation = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user?.id;

    const negotiation = await Negotiation.findById(id);
    if (!negotiation) {
      throw ApiError.notFound('Négociation non trouvée');
    }

    // Vérifier que l'utilisateur est impliqué dans la négociation
    const isDriver = negotiation.driver.toString() === userId;
    const isPassenger = negotiation.passenger.toString() === userId;

    if (!isDriver && !isPassenger) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à accéder à cette négociation');
    }

    // Vérifier que la négociation est en cours
    if (negotiation.status !== 'pending') {
      throw ApiError.badRequest('Cette négociation n\'est plus active');
    }

    // Vérifier que c'est bien la personne qui doit accepter (celle qui n'a pas fait la dernière offre)
    if (
      (isDriver && negotiation.lastOfferBy === 'driver') ||
      (isPassenger && negotiation.lastOfferBy === 'passenger')
    ) {
      throw ApiError.badRequest('Vous ne pouvez pas accepter votre propre offre');
    }

    // Récupérer le trajet complet
    const trip = await Trip.findById(negotiation.trip);
    if (!trip) {
      throw ApiError.notFound('Trajet non trouvé');
    }

    // Vérifier qu'il reste des places disponibles
    if (trip.availableSeats < 1) {
      throw ApiError.badRequest('Plus de places disponibles pour ce trajet');
    }

    // Ajouter le message d'acceptation
    const senderType = isDriver ? 'driver' : 'passenger';
    negotiation.messages.push({
      sender: userId as any,
      senderType,
      message: message || `J'accepte le prix de ${negotiation.currentOffer} DA.`,
      createdAt: new Date(),
    });

    negotiation.status = 'accepted';
    await negotiation.save();

    // Le prix négocié est le prix que le client paiera
    // On calcule la commission et le montant pour le conducteur
    const totalPrice = negotiation.currentOffer; // Prix négocié que le client paie
    const appCommission = await calculateCommission(totalPrice); // Commission dynamique depuis la DB
    const driverAmount = await calculateDriverAmount(totalPrice); // Montant pour le conducteur = prix - commission

    // Créer automatiquement la réservation au prix négocié
    const booking = await Booking.create({
      trip: negotiation.trip,
      passenger: negotiation.passenger,
      driver: trip.driver,
      seats: 1, // Par défaut 1 place
      totalPrice, // Prix total que le client paie (avec commission)
      appCommission, // Commission de l'application
      driverAmount, // Montant que le conducteur recevra
      status: 'confirmed', // Confirmé automatiquement
      negotiationId: negotiation._id, // Référence à la négociation
      message: `Réservation créée suite à une négociation acceptée. Prix client: ${totalPrice.toFixed(2)} DA (Conducteur reçoit: ${driverAmount.toFixed(2)} DA, Commission app: ${appCommission.toFixed(2)} DA)`,
    });

    // Diminuer le nombre de places disponibles
    trip.availableSeats -= 1;
    // Ajouter le passager à la liste des passagers
    if (!trip.passengers.includes(negotiation.passenger)) {
      trip.passengers.push(negotiation.passenger);
    }
    await trip.save();

    console.log(`✅ Réservation créée automatiquement: ${booking._id}`);
    console.log(`📉 Places disponibles: ${trip.availableSeats + 1} → ${trip.availableSeats}`);

    const populatedNegotiation = await Negotiation.findById(negotiation._id)
      .populate('passenger', 'firstName lastName profilePicture')
      .populate('driver', 'firstName lastName profilePicture')
      .populate('trip', 'departure destination departureTime price');

    // 📱 Envoyer une notification push aux deux parties
    try {
      const tripDetails = `${trip.departure.city} → ${trip.destination.city}`;
      const finalPrice = negotiation.currentOffer;
      
      // Notifier celui qui a accepté
      await notifyNegotiationAccepted(
        userId!, 
        tripDetails, 
        finalPrice, 
        isDriver,
        negotiation._id as any, // Ajouter le negotiationId
        trip._id as any // Ajouter le tripId
      );
      
      // Notifier l'autre partie
      const otherId = isDriver ? negotiation.passenger : negotiation.driver;
      await notifyNegotiationAccepted(
        otherId, 
        tripDetails, 
        finalPrice, 
        !isDriver,
        negotiation._id as any, // Ajouter le negotiationId
        trip._id as any // Ajouter le tripId
      );
      
      console.log(`📱 Notifications d'acceptation envoyées aux deux parties`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications:', error);
    }

    const response: SuccessResponse = {
      success: true,
      data: {
        negotiation: populatedNegotiation,
        booking: booking,
        remainingSeats: trip.availableSeats,
      },
      message: `Négociation acceptée ! Réservation créée au prix de ${negotiation.currentOffer} DA. Il reste ${trip.availableSeats} place(s) disponible(s).`,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   POST /api/negotiations/:id/reject
 * @desc    Rejeter une négociation
 * @access  Private
 */
export const rejectNegotiation = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user?.id;

    const negotiation = await Negotiation.findById(id);
    if (!negotiation) {
      throw ApiError.notFound('Négociation non trouvée');
    }

    // Vérifier que l'utilisateur est impliqué dans la négociation
    const isDriver = negotiation.driver.toString() === userId;
    const isPassenger = negotiation.passenger.toString() === userId;

    if (!isDriver && !isPassenger) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à accéder à cette négociation');
    }

    // Vérifier que la négociation est en cours
    if (negotiation.status !== 'pending') {
      throw ApiError.badRequest('Cette négociation n\'est plus active');
    }

    // Ajouter le message de rejet
    const senderType = isDriver ? 'driver' : 'passenger';
    negotiation.messages.push({
      sender: userId as any,
      senderType,
      message: message || 'Je refuse cette proposition.',
      createdAt: new Date(),
    });

    negotiation.status = 'rejected';
    await negotiation.save();

    const populatedNegotiation = await Negotiation.findById(negotiation._id)
      .populate('passenger', 'firstName lastName profilePicture')
      .populate('driver', 'firstName lastName profilePicture')
      .populate('trip', 'departure destination departureTime price');

    // 📱 Envoyer une notification push à l'autre partie
    try {
      if (populatedNegotiation) {
        const recipientId = isDriver ? negotiation.passenger : negotiation.driver;
        const trip = populatedNegotiation.trip as any;
        const tripDetails = `${trip.departure.city} → ${trip.destination.city}`;
        
        await notifyNegotiationRejected(
          recipientId,
          tripDetails,
          negotiation._id as any, // negotiationId
          negotiation.trip // tripId
        );
        console.log(`📱 Notification de refus de négociation envoyée à ${recipientId}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', error);
    }

    const response: SuccessResponse = {
      success: true,
      data: populatedNegotiation,
      message: 'Négociation refusée',
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/negotiations/trip/:tripId
 * @desc    Récupérer les négociations d'un trajet (pour le conducteur)
 * @access  Private
 */
export const getTripNegotiations = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { tripId } = req.params;
    const userId = req.user?.id;

    // Vérifier que le trajet existe et que l'utilisateur est le conducteur
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw ApiError.notFound('Trajet non trouvé');
    }

    if (trip.driver.toString() !== userId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à voir ces négociations');
    }

    const negotiations = await Negotiation.find({ trip: tripId })
      .populate('passenger', 'firstName lastName profilePicture rating')
      .sort({ updatedAt: -1 });

    const response: SuccessResponse = {
      success: true,
      data: negotiations,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/negotiations/my
 * @desc    Récupérer les négociations de l'utilisateur
 * @access  Private
 */
export const getMyNegotiations = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const { status } = req.query;

    const filter: any = {
      $or: [{ passenger: userId }, { driver: userId }],
    };

    if (status) {
      filter.status = status;
    }

    const negotiations = await Negotiation.find(filter)
      .populate('passenger', 'firstName lastName profilePicture')
      .populate('driver', 'firstName lastName profilePicture')
      .populate('trip', 'departure destination departureTime price priceType status')
      .sort({ updatedAt: -1 });

    const response: SuccessResponse = {
      success: true,
      data: negotiations,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/negotiations/:id
 * @desc    Récupérer les détails d'une négociation
 * @access  Private
 */
export const getNegotiationById = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const negotiation = await Negotiation.findById(id)
      .populate('passenger', 'firstName lastName profilePicture')
      .populate('driver', 'firstName lastName profilePicture')
      .populate('trip', 'departure destination departureTime price priceType status');

    if (!negotiation) {
      throw ApiError.notFound('Négociation non trouvée');
    }

    // Vérifier que l'utilisateur est impliqué dans la négociation
    if (
      negotiation.driver.toString() !== userId &&
      negotiation.passenger.toString() !== userId
    ) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à accéder à cette négociation');
    }

    const response: SuccessResponse = {
      success: true,
      data: negotiation,
    };

    res.status(200).json(response);
  }
);

