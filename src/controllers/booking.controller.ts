import { Response, NextFunction } from 'express';
import Booking from '../models/Booking';
import Trip from '../models/Trip';
import User from '../models/User';
import Review from '../models/Review';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest, CreateBookingData, SuccessResponse } from '../types';
import { calculateCommission, calculateDriverAmount } from '../config/constants';
import { calculateDistance } from '../services/geocoding.service';
import { notifyDriverNewBooking, notifyPassengerBookingConfirmed, notifyPassengerBookingRejected, notifyBookingCancelled } from '../services/notification.service';

/**
 * Controller pour la gestion des réservations
 */

// Frais d'annulation
const CANCELLATION_FEE = 200; // 200 DA
// Rayon de proximité pour vérifier la présence (en mètres)
const PROXIMITY_RADIUS = 500; // 500 mètres

/**
 * @route   POST /api/bookings
 * @desc    Créer une nouvelle réservation
 * @access  Private
 */
export const createBooking = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { tripId, seats, message }: CreateBookingData = req.body;

    // Récupérer le trajet
    const trip = await Trip.findById(tripId);

    if (!trip) {
      throw ApiError.notFound('Trajet non trouvé');
    }

    // Vérifier que le trajet est actif
    if (trip.status !== 'active') {
      throw ApiError.badRequest('Ce trajet n\'est plus disponible');
    }

    // Vérifier que le trajet n'est pas dans le passé
    if (trip.departureTime < new Date()) {
      throw ApiError.badRequest('Ce trajet est déjà parti');
    }

    // Vérifier qu'il y a assez de places
    if (trip.availableSeats < seats) {
      throw ApiError.badRequest(
        `Pas assez de places disponibles. Places restantes: ${trip.availableSeats}`
      );
    }

    // Vérifier que l'utilisateur n'est pas le conducteur
    if (trip.driver.toString() === req.user?.id) {
      throw ApiError.badRequest('Vous ne pouvez pas réserver votre propre trajet');
    }

    // Vérifier que l'utilisateur n'a pas déjà réservé ce trajet
    const existingBooking = await Booking.findOne({
      trip: tripId,
      passenger: req.user?.id,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingBooking) {
      throw ApiError.badRequest('Vous avez déjà réservé ce trajet');
    }

    // Le prix du trajet contient déjà la commission (prix client)
    const clientPricePerSeat = trip.price; // Prix client avec commission incluse
    const totalPrice = clientPricePerSeat * seats;
    
    // Calculer la commission de l'application (taux dynamique depuis la DB)
    const appCommission = await calculateCommission(totalPrice);
    
    // Calculer le montant que le conducteur recevra
    const driverAmount = await calculateDriverAmount(totalPrice);

    // Créer la réservation
    const booking = await Booking.create({
      trip: tripId,
      passenger: req.user?.id,
      driver: trip.driver,
      seats,
      totalPrice,
      appCommission,
      driverAmount,
      message,
      status: 'pending',
    });

    // NE PAS retirer les places maintenant - elles seront retirées à la confirmation
    // Les places restent disponibles tant que le conducteur n'a pas accepté

    const populatedBooking = await Booking.findById(booking._id)
      .populate('trip')
      .populate('passenger', 'firstName lastName profilePicture')
      .populate('driver', 'firstName lastName profilePicture');

    // 📱 Envoyer une notification push au conducteur
    try {
      const passenger = await User.findById(req.user?.id);
      const passengerName = passenger ? `${passenger.firstName} ${passenger.lastName}` : 'Un passager';
      const tripDetails = `${trip.departure.city} → ${trip.destination.city}`;
      
      await notifyDriverNewBooking(
        trip.driver,
        passengerName,
        tripDetails,
        seats,
        totalPrice,
        tripId, // Ajouter le tripId
        booking._id as any // Ajouter le bookingId
      );
      console.log(`📱 Notification envoyée au conducteur ${trip.driver}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', error);
      // Ne pas bloquer la création de la réservation si la notification échoue
    }

    const response: SuccessResponse = {
      success: true,
      data: populatedBooking,
      message: 'Réservation créée avec succès',
    };

    res.status(201).json(response);
  }
);

/**
 * @route   GET /api/bookings/:id
 * @desc    Récupérer les détails d'une réservation
 * @access  Private
 */
export const getBookingById = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('trip')
      .populate('passenger', 'firstName lastName profilePicture phoneNumber')
      .populate('driver', 'firstName lastName profilePicture phoneNumber');

    if (!booking) {
      throw ApiError.notFound('Réservation non trouvée');
    }

    // Vérifier que l'utilisateur est soit le passager soit le conducteur
    if (
      booking.passenger._id.toString() !== req.user?.id &&
      booking.driver._id.toString() !== req.user?.id
    ) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à voir cette réservation');
    }

    const response: SuccessResponse = {
      success: true,
      data: booking,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   PUT /api/bookings/:id/confirm
 * @desc    Confirmer une réservation (conducteur)
 * @access  Private
 */
export const confirmBooking = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('trip')
      .populate('passenger', 'firstName lastName profilePicture phoneNumber');

    if (!booking) {
      throw ApiError.notFound('Réservation non trouvée');
    }

    // Vérifier que l'utilisateur est le conducteur
    if (booking.driver.toString() !== req.user?.id) {
      throw ApiError.forbidden('Seul le conducteur peut confirmer cette réservation');
    }

    // Vérifier que la réservation est en attente
    if (booking.status !== 'pending') {
      throw ApiError.badRequest('Cette réservation ne peut pas être confirmée');
    }

    // Récupérer le trajet pour mettre à jour les places disponibles
    const trip = await Trip.findById((booking.trip as any)._id || booking.trip);
    if (!trip) {
      throw ApiError.notFound('Trajet non trouvé');
    }

    // Vérifier qu'il y a assez de places disponibles
    if (trip.availableSeats < booking.seats) {
      throw ApiError.badRequest(
        `Plus assez de places disponibles. Places restantes: ${trip.availableSeats}, Places demandées: ${booking.seats}`
      );
    }

    // Confirmer la réservation en utilisant findByIdAndUpdate pour éviter les problèmes de validation
    const updatedBooking = await Booking.findByIdAndUpdate(
      booking._id,
      {
        status: 'confirmed',
        confirmedAt: new Date(),
        // S'assurer que les champs requis sont présents
        appCommission: booking.appCommission || 0,
        driverAmount: booking.driverAmount || 0,
      },
      { new: true }
    );

    if (!updatedBooking) {
      throw ApiError.internal('Erreur lors de la confirmation de la réservation');
    }

    // Retirer les places du trajet et ajouter le passager
    trip.availableSeats -= booking.seats;
    if (!trip.passengers.includes(booking.passenger)) {
      trip.passengers.push(booking.passenger);
    }
    await trip.save();

    // Mettre à jour le compteur de trajets du passager (uniquement à la confirmation)
    await User.findByIdAndUpdate(booking.passenger, {
      $inc: { tripsAsPassenger: 1 },
    });

    const finalBooking = await Booking.findById(updatedBooking._id)
      .populate('trip')
      .populate('passenger', 'firstName lastName profilePicture phoneNumber')
      .populate('driver', 'firstName lastName profilePicture phoneNumber');

    // 📱 Envoyer une notification push au passager
    try {
      const tripDetails = `${trip.departure.city} → ${trip.destination.city}`;
      await notifyPassengerBookingConfirmed(
        booking.passenger, 
        tripDetails,
        booking._id as any, // Ajouter le bookingId
        trip._id as any // Ajouter le tripId
      );
      console.log(`📱 Notification de confirmation envoyée au passager ${booking.passenger}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', error);
    }

    const response: SuccessResponse = {
      success: true,
      data: finalBooking,
      message: 'Réservation confirmée avec succès',
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/bookings/my/bookings
 * @desc    Récupérer les réservations de l'utilisateur connecté
 * @access  Private
 */
export const getMyBookings = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { status } = req.query;

    const filter: any = { passenger: req.user?.id };
    
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate({
        path: 'trip',
        populate: {
          path: 'driver',
          select: 'firstName lastName profilePicture rating',
        },
      })
      .sort({ createdAt: -1 });

    const response: SuccessResponse = {
      success: true,
      data: bookings,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/bookings/trip/:tripId
 * @desc    Récupérer les réservations d'un trajet (pour le conducteur)
 * @access  Private
 */
export const getTripBookings = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { tripId } = req.params;

    // Vérifier que le trajet existe et que l'utilisateur est le conducteur
    const trip = await Trip.findById(tripId);

    if (!trip) {
      throw ApiError.notFound('Trajet non trouvé');
    }

    if (trip.driver.toString() !== req.user?.id) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à voir ces réservations');
    }

    const bookings = await Booking.find({ trip: tripId })
      .populate('passenger', 'firstName lastName profilePicture phoneNumber rating')
      .populate('trip', 'departure destination departureTime availableSeats price priceType distance')
      .sort({ createdAt: -1 });

    const response: SuccessResponse = {
      success: true,
      data: bookings,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Mettre à jour le statut d'une réservation
 * @access  Private
 */
export const updateBookingStatus = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const booking = await Booking.findById(id).populate('trip');

    if (!booking) {
      throw ApiError.notFound('Réservation non trouvée');
    }

    // Vérifier que l'utilisateur est autorisé à modifier cette réservation
    const isPassenger = booking.passenger.toString() === req.user?.id;
    const isDriver = booking.driver.toString() === req.user?.id;

    if (!isPassenger && !isDriver) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à modifier cette réservation');
    }

    // Logique selon le nouveau statut
    if (status === 'confirmed') {
      // Seul le conducteur peut confirmer
      if (!isDriver) {
        throw ApiError.forbidden('Seul le conducteur peut confirmer une réservation');
      }
      
      // Vérifier que la réservation est en attente
      if (booking.status !== 'pending') {
        throw ApiError.badRequest('Cette réservation ne peut pas être confirmée');
      }

      // Récupérer le trajet pour retirer les places
      const trip = await Trip.findById(booking.trip);
      if (trip) {
        // Vérifier qu'il y a assez de places disponibles
        if (trip.availableSeats < booking.seats) {
          throw ApiError.badRequest(
            `Plus assez de places disponibles. Places restantes: ${trip.availableSeats}, Places demandées: ${booking.seats}`
          );
        }

        // Retirer les places et ajouter le passager
        trip.availableSeats -= booking.seats;
        if (!trip.passengers.includes(booking.passenger)) {
          trip.passengers.push(booking.passenger);
        }
        await trip.save();
      }

      booking.status = 'confirmed';
      booking.confirmedAt = new Date();

      // Mettre à jour le compteur de trajets du passager
      await User.findByIdAndUpdate(booking.passenger, {
        $inc: { tripsAsPassenger: 1 },
      });
    } else if (status === 'cancelled') {
      // Le passager ou le conducteur peut annuler
      if (booking.status === 'cancelled') {
        throw ApiError.badRequest('Cette réservation est déjà annulée');
      }

      const previousStatus = booking.status;
      booking.status = 'cancelled';
      booking.cancellationReason = cancellationReason;
      booking.cancelledBy = req.user?.id as any;
      booking.cancelledAt = new Date();

      // Remettre les places disponibles SEULEMENT si la réservation était confirmée
      if (previousStatus === 'confirmed') {
        const trip = await Trip.findById(booking.trip);
        if (trip) {
          trip.availableSeats += booking.seats;
          // Retirer le passager de la liste
          trip.passengers = trip.passengers.filter(
            (p) => p.toString() !== booking.passenger.toString()
          );
          await trip.save();
        }

        // Décrémenter le compteur de trajets du passager
        await User.findByIdAndUpdate(booking.passenger, {
          $inc: { tripsAsPassenger: -1 },
        });
      }
      // Si la réservation était "pending", les places n'ont jamais été retirées, donc rien à remettre
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('trip')
      .populate('passenger', 'firstName lastName profilePicture')
      .populate('driver', 'firstName lastName profilePicture');

    // 📱 Envoyer une notification si c'est une annulation
    if (status === 'cancelled' && updatedBooking) {
      try {
        const trip = updatedBooking.trip as any;
        const tripDetails = `${trip.departure.city} → ${trip.destination.city}`;
        
        // Notifier l'autre partie
        const recipientId = isDriver ? booking.passenger : booking.driver;
        const cancelledBy = isDriver ? 'driver' : 'passenger';
        
        await notifyBookingCancelled(
          recipientId,
          tripDetails,
          cancelledBy,
          booking._id as any, // bookingId
          booking.trip, // tripId
          cancellationReason
        );
        console.log(`📱 Notification d'annulation envoyée à ${recipientId}`);
      } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de la notification:', error);
      }
    }

    const response: SuccessResponse = {
      success: true,
      data: updatedBooking,
      message: `Réservation ${status === 'confirmed' ? 'confirmée' : 'annulée'} avec succès`,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   POST /api/bookings/:id/review
 * @desc    Créer un avis pour une réservation
 * @access  Private
 */
export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const booking = await Booking.findById(id).populate('trip');

    if (!booking) {
      throw ApiError.notFound('Réservation non trouvée');
    }

    // Vérifier que la réservation est terminée
    if (booking.status !== 'completed') {
      throw ApiError.badRequest('Vous ne pouvez évaluer qu\'un trajet terminé');
    }

    // Vérifier que l'utilisateur fait partie de la réservation
    const isPassenger = booking.passenger.toString() === req.user?.id;
    const isDriver = booking.driver.toString() === req.user?.id;

    if (!isPassenger && !isDriver) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à évaluer cette réservation');
    }

    // Déterminer qui est évalué
    const reviewee = isPassenger ? booking.driver : booking.passenger;
    const reviewerRole = isPassenger ? 'passenger' : 'driver';

    // Vérifier qu'un avis n'a pas déjà été créé
    const existingReview = await Review.findOne({
      booking: id,
      reviewer: req.user?.id,
    });

    if (existingReview) {
      throw ApiError.badRequest('Vous avez déjà évalué cette réservation');
    }

    // Créer l'avis
    const review = await Review.create({
      trip: booking.trip,
      booking: id,
      reviewer: req.user?.id,
      reviewee,
      rating,
      comment,
      reviewerRole,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('reviewee', 'firstName lastName profilePicture')
      .populate('trip', 'departure destination departureTime');

    const response: SuccessResponse = {
      success: true,
      data: populatedReview,
      message: 'Avis créé avec succès',
    };

    res.status(201).json(response);
  }
);

/**
 * @route   POST /api/bookings/:id/cancel-with-location
 * @desc    Annuler une réservation avec vérification de géolocalisation
 * @access  Private
 */
export const cancelBookingWithLocation = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { cancellationReason, currentLatitude, currentLongitude } = req.body;

    // Validation des coordonnées
    if (currentLatitude === undefined || currentLongitude === undefined) {
      throw ApiError.badRequest('La géolocalisation est requise pour annuler');
    }

    const booking = await Booking.findById(id).populate('trip');

    if (!booking) {
      throw ApiError.notFound('Réservation non trouvée');
    }

    if (booking.status === 'cancelled') {
      throw ApiError.badRequest('Cette réservation est déjà annulée');
    }

    if (booking.status === 'completed') {
      throw ApiError.badRequest('Impossible d\'annuler une réservation terminée');
    }

    // Vérifier que l'utilisateur est autorisé
    const isPassenger = booking.passenger.toString() === req.user?.id;
    const isDriver = booking.driver.toString() === req.user?.id;

    if (!isPassenger && !isDriver) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à annuler cette réservation');
    }

    const trip: any = booking.trip;
    const departureLocation = trip.departure;
    let cancellationFee = 0;
    let canCancel = false;
    let cancelReason = '';

    // Calculer la distance entre l'utilisateur et le point de départ
    const distanceFromDeparture = calculateDistance(
      currentLatitude,
      currentLongitude,
      departureLocation.coordinates[1], // latitude
      departureLocation.coordinates[0]  // longitude
    ) * 1000; // Convertir en mètres

    if (isPassenger) {
      // === ANNULATION PAR LE PASSAGER ===
      
      // Vérifier si le passager est à proximité du point de départ
      const passengerAtDeparture = distanceFromDeparture <= PROXIMITY_RADIUS;

      if (passengerAtDeparture) {
        // Le passager est sur place, il ne peut pas annuler
        throw ApiError.badRequest(
          'Vous ne pouvez pas annuler maintenant. Vous êtes déjà au point de rendez-vous. Contactez le conducteur directement.'
        );
      }

      // Le passager peut annuler mais on vérifie si le conducteur est en route
      // Pour ça, on pourrait vérifier l'heure ou demander la position du conducteur
      // Pour simplifier, on applique des frais si la réservation est confirmée
      if (booking.status === 'confirmed') {
        cancellationFee = CANCELLATION_FEE;
        cancelReason = 'Annulation par le passager avec frais (conducteur confirmé)';
      } else {
        cancelReason = 'Annulation par le passager (sans frais)';
      }

      canCancel = true;

      // Sauvegarder la position du passager
      booking.passengerLocationAtCancellation = {
        latitude: currentLatitude,
        longitude: currentLongitude,
      };

    } else if (isDriver) {
      // === ANNULATION PAR LE CONDUCTEUR ===

      // Vérifier si le conducteur est au point de départ
      const driverAtDeparture = distanceFromDeparture <= PROXIMITY_RADIUS;

      if (!driverAtDeparture) {
        throw ApiError.badRequest(
          `Vous devez être au point de rendez-vous pour annuler (vous êtes à ${(distanceFromDeparture / 1000).toFixed(2)} km). Le passager doit annuler ou vous devez le contacter.`
        );
      }

      // Le conducteur est sur place
      // On vérifie maintenant si le passager est aussi sur place
      // Pour ça, on devrait avoir la position du passager en temps réel
      // Ici, on suppose qu'il n'est pas là si la réservation est confirmée depuis un moment
      
      // Le conducteur peut annuler et le passager paie des frais
      cancellationFee = CANCELLATION_FEE;
      cancelReason = 'Annulation par le conducteur (passager absent au rendez-vous)';
      canCancel = true;

      // Sauvegarder la position du conducteur
      booking.driverLocationAtCancellation = {
        latitude: currentLatitude,
        longitude: currentLongitude,
      };
    }

    if (!canCancel) {
      throw ApiError.badRequest('Annulation impossible dans ces conditions');
    }

    // S'assurer que les champs requis sont présents (au cas où ils ne seraient pas définis)
    const appCommission = booking.appCommission || calculateCommission(booking.totalPrice);
    const driverAmount = booking.driverAmount || calculateDriverAmount(booking.totalPrice);

    // Appliquer l'annulation avec update direct pour éviter la validation
    await Booking.findByIdAndUpdate(booking._id, {
      status: 'cancelled',
      cancellationReason: cancellationReason || cancelReason,
      cancelledBy: req.user?.id,
      cancelledAt: new Date(),
      cancellationFee,
      appCommission,
      driverAmount,
      ...(isPassenger && {
        passengerLocationAtCancellation: {
          latitude: currentLatitude,
          longitude: currentLongitude,
        }
      }),
      ...(isDriver && {
        driverLocationAtCancellation: {
          latitude: currentLatitude,
          longitude: currentLongitude,
        }
      })
    });

    // Remettre les places disponibles
    const tripDoc = await Trip.findById(booking.trip);
    if (tripDoc) {
      tripDoc.availableSeats += booking.seats;
      tripDoc.passengers = tripDoc.passengers.filter(
        (p) => p.toString() !== booking.passenger.toString()
      );
      await tripDoc.save();
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('trip')
      .populate('passenger', 'firstName lastName profilePicture phoneNumber')
      .populate('driver', 'firstName lastName profilePicture phoneNumber');

    // 📱 Envoyer une notification à l'autre partie
    if (updatedBooking) {
      try {
        const trip = updatedBooking.trip as any;
        const tripDetails = `${trip.departure.city} → ${trip.destination.city}`;
        const recipientId = isDriver ? booking.passenger : booking.driver;
        const cancelledBy = isDriver ? 'driver' : 'passenger';
        
        await notifyBookingCancelled(
          recipientId,
          tripDetails,
          cancelledBy,
          booking._id as any, // bookingId
          booking.trip, // tripId
          cancellationReason || cancelReason
        );
        console.log(`📱 Notification d'annulation (avec géoloc) envoyée à ${recipientId}`);
      } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de la notification:', error);
      }
    }

    const response: SuccessResponse = {
      success: true,
      data: {
        booking: updatedBooking,
        cancellationFee,
        message: cancellationFee > 0
          ? `Réservation annulée. Des frais de ${cancellationFee} DA s'appliquent.`
          : 'Réservation annulée sans frais.',
      },
      message: 'Réservation annulée avec succès',
    };

    res.status(200).json(response);
  }
);

