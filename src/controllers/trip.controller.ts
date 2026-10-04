import { Request, Response, NextFunction } from 'express';
import Trip from '../models/Trip';
import User from '../models/User';
import Booking from '../models/Booking';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest, CreateTripData, SearchTripQuery, SuccessResponse } from '../types';
import { calculateDistance } from '../services/geocoding.service';
import { getCommissionRate } from '../config/constants';

/**
 * Controller pour la gestion des trajets
 */

/**
 * @route   POST /api/trips
 * @desc    Créer un nouveau trajet
 * @access  Private
 */
export const createTrip = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const tripData: CreateTripData = req.body;
    console.log('📝 Données reçues du frontend:', tripData);

    // Vérifier que l'utilisateur a un numéro de permis de conduire
    const driver = await User.findById(req.user?.id);
    if (!driver) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    if (!driver.driverLicenseNumber) {
      throw ApiError.badRequest('Vous devez renseigner votre numéro de permis de conduire dans votre profil pour publier un trajet');
    }

    // Valider les données requises
    if (!tripData.departure?.city || !tripData.destination?.city) {
      throw ApiError.badRequest('Les villes de départ et de destination sont requises');
    }

    if (!tripData.price || tripData.price <= 0) {
      throw ApiError.badRequest('Le prix doit être supérieur à 0');
    }

    if (!tripData.availableSeats || tripData.availableSeats < 1 || tripData.availableSeats > 8) {
      throw ApiError.badRequest('Le nombre de places doit être entre 1 et 8');
    }

    // Convertir la date de départ
    const departureTime = new Date(tripData.departureTime);

    // Utiliser les coordonnées si fournies
    const departureCoordinates: [number, number] = [
      tripData.departure.longitude ?? 0,
      tripData.departure.latitude ?? 0
    ];
    
    const destinationCoordinates: [number, number] = [
      tripData.destination.longitude ?? 0,
      tripData.destination.latitude ?? 0
    ];

    // Calculer la distance si les coordonnées sont valides
    let distance: number | undefined;

    if (
      departureCoordinates[0] !== 0 && 
      departureCoordinates[1] !== 0 &&
      destinationCoordinates[0] !== 0 && 
      destinationCoordinates[1] !== 0
    ) {
      // Calculer la distance en km
      distance = calculateDistance(
        departureCoordinates[1], // latitude
        departureCoordinates[0], // longitude
        destinationCoordinates[1],
        destinationCoordinates[0]
      );

      console.log(`📍 Distance calculée: ${distance.toFixed(2)} km`);
    }

    const trip = await Trip.create({
      driver: req.user?.id,
      departure: {
        type: 'Point',
        coordinates: departureCoordinates,
        city: tripData.departure.city,
        address: tripData.departure.address, // Adresse complète optionnelle
      },
      destination: {
        type: 'Point',
        coordinates: destinationCoordinates,
        city: tripData.destination.city,
        address: tripData.destination.address, // Adresse complète optionnelle
      },
      departureTime,
      price: tripData.price,
      priceType: tripData.priceType || 'fixed',
      availableSeats: tripData.availableSeats,
      description: tripData.description,
      distance,
    });

    // Mettre à jour le compteur de trajets du conducteur
    await User.findByIdAndUpdate(req.user?.id, {
      $inc: { tripsAsDriver: 1 },
    });

    const populatedTrip = await Trip.findById(trip._id).populate(
      'driver',
      'firstName lastName profilePicture rating'
    );

    const response: SuccessResponse = {
      success: true,
      data: populatedTrip,
      message: 'Trajet créé avec succès',
    };

    res.status(201).json(response);
  }
);

/**
 * @route   GET /api/trips/search
 * @desc    Rechercher des trajets
 * @access  Public
 */
export const searchTrips = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const {
      departureCity,
      destinationCity,
      departureLongitude,
      departureLatitude,
      destinationLongitude,
      destinationLatitude,
      date,
      minSeats,
      maxPrice,
      radius = 50,
    }: SearchTripQuery = req.query as any;
    //faire une array contietn departureLongitude  et destinationLongitude
    const coordinatesdeparture = [departureLongitude, departureLatitude];
    const coordinatesdestination = [destinationLongitude, destinationLatitude];
    console.log('🔍 Coordinates:', coordinatesdeparture, coordinatesdestination);
    console.log('🔍 Date:', date);
    const trips = await Trip.find({
      'departure.coordinates': coordinatesdeparture,
          'destination.coordinates':coordinatesdestination,
          'availableSeats': { $gte: minSeats },
            'departureTime': { $gte: new Date(date || new Date()) },
          'status': 'active',
    })
    .populate('driver', 'firstName lastName profilePicture rating totalRatings bio')
    .sort({ departureTime: 1 });

    const response: SuccessResponse = {
      success: true,
      data: trips,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/trips/:id
 * @desc    Récupérer les détails d'un trajet
 * @access  Public
 */
export const getTripById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const trip = await Trip.findById(id)
      .populate('driver', 'firstName lastName profilePicture rating bio totalRatings')
      .populate('passengers', 'firstName lastName profilePicture');

    if (!trip) {
      throw ApiError.notFound('Trajet non trouvé');
    }

    const response: SuccessResponse = {
      success: true,
      data: trip,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   PUT /api/trips/:id
 * @desc    Mettre à jour un trajet
 * @access  Private
 */
export const updateTrip = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const trip = await Trip.findById(id);

    if (!trip) {
      throw ApiError.notFound('Trajet non trouvé');
    }

    // Vérifier que l'utilisateur est le conducteur
    if (trip.driver.toString() !== req.user?.id) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à modifier ce trajet');
    }

    // Vérifier que le trajet n'est pas déjà parti
    if (trip.departureTime < new Date()) {
      throw ApiError.badRequest('Impossible de modifier un trajet déjà parti');
    }

    // Mettre à jour les champs autorisés
    const allowedUpdates = ['departureTime', 'price', 'priceType', 'availableSeats', 'description', 'vehicleInfo'];
    const updates = Object.keys(req.body);

    updates.forEach((update) => {
      if (allowedUpdates.includes(update)) {
        (trip as any)[update] = req.body[update];
      }
    });

    await trip.save();

    const updatedTrip = await Trip.findById(trip._id).populate(
      'driver',
      'firstName lastName profilePicture rating'
    );

    const response: SuccessResponse = {
      success: true,
      data: updatedTrip,
      message: 'Trajet mis à jour avec succès',
    };

    res.status(200).json(response);
  }
);

/**
 * @route   DELETE /api/trips/:id
 * @desc    Annuler un trajet
 * @access  Private
 */
export const cancelTrip = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const trip = await Trip.findById(id);

    if (!trip) {
      throw ApiError.notFound('Trajet non trouvé');
    }

    // Vérifier que l'utilisateur est le conducteur
    if (trip.driver.toString() !== req.user?.id) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à annuler ce trajet');
    }

    // Vérifier que le trajet n'est pas déjà annulé
    if (trip.status === 'cancelled') {
      throw ApiError.badRequest('Ce trajet est déjà annulé');
    }

    // Marquer le trajet comme annulé
    trip.status = 'cancelled';
    await trip.save();

    // Récupérer toutes les réservations actives avant de les annuler
    const activeBookings = await Booking.find({
      trip: trip._id,
      status: { $in: ['pending', 'confirmed'] }
    });

    // Annuler toutes les réservations associées
    await Booking.updateMany(
      { trip: trip._id, status: { $in: ['pending', 'confirmed'] } },
      { status: 'cancelled', cancellationReason: cancellationReason || 'Trajet annulé par le conducteur' }
    );

    // 📱 Envoyer une notification à tous les passagers concernés
    if (activeBookings.length > 0) {
      const tripDetails = `${trip.departure.city} → ${trip.destination.city}`;
      const reason = cancellationReason || 'Le conducteur a annulé le trajet';
      
      // Importer le service de notification dynamiquement
      const { notifyTripCancelled } = await import('../services/notification.service');
      
      // Envoyer une notification à chaque passager
      for (const booking of activeBookings) {
        try {
          await notifyTripCancelled(
            booking.passenger,
            tripDetails,
            trip._id as any, // tripId
            reason
          );
          console.log(`📱 Notification d'annulation de trajet envoyée au passager ${booking.passenger}`);
        } catch (error) {
          console.error(`❌ Erreur lors de l'envoi de la notification au passager ${booking.passenger}:`, error);
        }
      }
    }

    const response: SuccessResponse = {
      success: true,
      data: trip,
      message: 'Trajet annulé avec succès',
    };

    res.status(200).json(response);
  }
);

/**
 * @route   PUT /api/trips/:id/complete
 * @desc    Marquer un trajet comme terminé
 * @access  Private
 */
export const completeTrip = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const trip = await Trip.findById(id);

    if (!trip) {
      throw ApiError.notFound('Trajet non trouvé');
    }

    // Vérifier que l'utilisateur est le conducteur
    if (trip.driver.toString() !== req.user?.id) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à terminer ce trajet');
    }

    // Vérifier que le trajet est actif
    if (trip.status !== 'active') {
      throw ApiError.badRequest('Seuls les trajets actifs peuvent être marqués comme terminés');
    }

    // Marquer le trajet comme terminé
    trip.status = 'completed';
    await trip.save();

    // Récupérer toutes les réservations confirmées avant de les marquer comme terminées
    const confirmedBookings = await Booking.find({
      trip: trip._id,
      status: 'confirmed'
    });

    // Marquer toutes les réservations confirmées comme terminées
    await Booking.updateMany(
      { trip: trip._id, status: 'confirmed' },
      { status: 'completed' }
    );

    // Incrémenter le compteur de trajets terminés du conducteur
    await User.findByIdAndUpdate(req.user?.id, {
      $inc: { tripsAsDriver: 1 },
    });

    // Envoyer la réponse immédiatement au client
    const response: SuccessResponse = {
      success: true,
      data: trip,
      message: 'Trajet marqué comme terminé avec succès',
    };

    res.status(200).json(response);

    // 📱 Envoyer les notifications en arrière-plan (après la réponse)
    // Cela évite les timeouts sur iOS
    if (confirmedBookings.length > 0) {
      const tripDetails = `${trip.departure.city} → ${trip.destination.city}`;
      
      // Utiliser setImmediate pour exécuter en arrière-plan
      setImmediate(async () => {
        try {
          // Importer le service de notification dynamiquement
          const { notifyTripCompleted } = await import('../services/notification.service');
          
          // Envoyer une notification à chaque passager
          for (const booking of confirmedBookings) {
            try {
              await notifyTripCompleted(
                booking.passenger,
                tripDetails,
                trip._id as any // tripId
              );
              console.log(`📱 Notification de trajet terminé envoyée au passager ${booking.passenger}`);
            } catch (error) {
              console.error(`❌ Erreur lors de l'envoi de la notification au passager ${booking.passenger}:`, error);
            }
          }
        } catch (error) {
          console.error('❌ Erreur lors de l\'import du service de notification:', error);
        }
      });
    }
  }
);

/**
 * @route   GET /api/trips/my/trips
 * @desc    Récupérer les trajets de l'utilisateur connecté
 * @access  Private
 */
export const getMyTrips = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { status } = req.query;

    const filter: any = { driver: req.user?.id };
    
    if (status) {
      filter.status = status;
    }

    const trips = await Trip.find(filter)
      .populate('driver', 'firstName lastName profilePicture rating')
      .populate('passengers', 'firstName lastName profilePicture')
      .sort({ departureTime: -1 });

    const response: SuccessResponse = {
      success: true,
      data: trips,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/trips/my/stats
 * @desc    Récupérer les statistiques du conducteur
 * @access  Private
 */
export const getDriverStats = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const driverId = req.user?.id;
console.log("driverId: " + driverId);
    // Récupérer l'utilisateur pour obtenir le rating
    const driver = await User.findById(driverId);
    if (!driver) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    // Récupérer tous les trajets du conducteur
    const trips = await Trip.find({ driver: driverId });

    // Récupérer toutes les réservations confirmées pour ces trajets
    const tripIds = trips.map(trip => trip._id);
    const bookings = await Booking.find({
      trip: { $in: tripIds },
      status: 'confirmed'
    }).populate('trip');

    // Récupérer le taux de commission dynamique
    const commissionRate = await getCommissionRate();
    
    // Calculer les statistiques
    let totalRevenue = 0;
    let totalPassengers = 0;

    bookings.forEach(booking => {
      totalRevenue += booking.totalPrice;
      totalPassengers += booking.seats;
    });

    const totalCommission = totalRevenue * commissionRate;
    const netRevenue = totalRevenue - totalCommission;

    // Compter les trajets par statut
    const activeTrips = trips.filter(t => t.status === 'active').length;
    const completedTrips = trips.filter(t => t.status === 'completed').length;
    const cancelledTrips = trips.filter(t => t.status === 'cancelled').length;

    const stats = {
      totalTrips: trips.length,
      activeTrips,
      completedTrips,
      cancelledTrips,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCommission: Math.round(totalCommission * 100) / 100,
      netRevenue: Math.round(netRevenue * 100) / 100,
      totalPassengers,
      averageRating: driver.rating || 0,
    };

    const response: SuccessResponse = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   POST /api/trips/recurring
 * @desc    Créer des trajets récurrents
 * @access  Private
 */
export const createRecurringTrips = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const {
      departure,
      destination,
      departureTime,
      price,
      priceType,
      availableSeats,
      description,
      recurringDays,
      startDate,
      endDate,
    } = req.body;

    console.log('📅 Création de trajets récurrents:', {
      startDate,
      endDate,
      recurringDays,
      departureTime,
    });

    const driver = await User.findById(req.user?.id);
    if (!driver) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    if (!driver.driverLicenseNumber) {
      throw ApiError.badRequest('Vous devez renseigner votre numéro de permis de conduire dans votre profil pour publier un trajet');
    }

    if (!departure?.city || !destination?.city) {
      throw ApiError.badRequest('Les villes de départ et de destination sont requises');
    }

    if (!price || price <= 0) {
      throw ApiError.badRequest('Le prix doit être supérieur à 0');
    }

    if (!availableSeats || availableSeats < 1 || availableSeats > 8) {
      throw ApiError.badRequest('Le nombre de places doit être entre 1 et 8');
    }

    if (!recurringDays || recurringDays.length === 0) {
      throw ApiError.badRequest('Vous devez sélectionner au moins un jour de la semaine');
    }

    if (!startDate || !endDate) {
      throw ApiError.badRequest('Les dates de début et de fin sont requises');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      throw ApiError.badRequest('La date de fin doit être après la date de début');
    }

    const threeMonthsLater = new Date(start);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    if (end > threeMonthsLater) {
      throw ApiError.badRequest('La période de récurrence ne peut pas dépasser 3 mois');
    }

    const [hours, minutes] = departureTime.split(':').map(Number);

    const departureCoordinates: [number, number] = [
      departure.longitude ?? 0,
      departure.latitude ?? 0
    ];
    
    const destinationCoordinates: [number, number] = [
      destination.longitude ?? 0,
      destination.latitude ?? 0
    ];

    let distance: number | undefined;
    if (
      departureCoordinates[0] !== 0 && 
      departureCoordinates[1] !== 0 &&
      destinationCoordinates[0] !== 0 && 
      destinationCoordinates[1] !== 0
    ) {
      distance = calculateDistance(
        departureCoordinates[1],
        departureCoordinates[0],
        destinationCoordinates[1],
        destinationCoordinates[0]
      );
      console.log(`📍 Distance calculée: ${distance.toFixed(2)} km`);
    }

    const tripsToCreate: any[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();

      if (recurringDays.includes(dayOfWeek)) {
        const tripDate = new Date(currentDate);
        tripDate.setHours(hours, minutes, 0, 0);

        if (tripDate > new Date()) {
          tripsToCreate.push({
            driver: req.user?.id,
            departure: {
              type: 'Point',
              coordinates: departureCoordinates,
              city: departure.city,
              address: departure.address,
            },
            destination: {
              type: 'Point',
              coordinates: destinationCoordinates,
              city: destination.city,
              address: destination.address,
            },
            departureTime: tripDate,
            price,
            priceType: priceType || 'fixed',
            availableSeats,
            description,
            distance,
            isRecurring: true,
            recurringDays,
            recurrenceEndDate: end,
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (tripsToCreate.length === 0) {
      throw ApiError.badRequest('Aucun trajet futur n\'a pu être généré avec ces paramètres');
    }

    if (tripsToCreate.length > 100) {
      throw ApiError.badRequest(`Trop de trajets générés (${tripsToCreate.length}). Maximum: 100. Réduisez la période ou le nombre de jours.`);
    }

    console.log(`✅ Création de ${tripsToCreate.length} trajets récurrents`);

    const createdTrips = await Trip.insertMany(tripsToCreate);

    await User.findByIdAndUpdate(req.user?.id, {
      $inc: { tripsAsDriver: createdTrips.length },
    });

    const response: SuccessResponse = {
      success: true,
      data: {
        count: createdTrips.length,
        trips: createdTrips,
        period: {
          start: startDate,
          end: endDate,
        },
        days: recurringDays,
      },
      message: `${createdTrips.length} trajet(s) récurrent(s) créé(s) avec succès`,
    };

    res.status(201).json(response);
  }
);

