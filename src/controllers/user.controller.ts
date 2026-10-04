import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Trip from '../models/Trip';
import Booking from '../models/Booking';
import Review from '../models/Review';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest, SuccessResponse, UpdateProfileData } from '../types';
import cloudinary from '../config/cloudinary';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Controller pour la gestion des utilisateurs
 */

/**
 * @route   GET /api/users/:id
 * @desc    Récupérer le profil d'un utilisateur
 * @access  Public
 */
export const getUserProfile = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    const response: SuccessResponse = {
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        cin: user.cin,
        driverLicenseNumber: user.driverLicenseNumber,
        vehicle: user.vehicle,
        rating: user.rating,
        totalRatings: user.totalRatings,
        tripsAsDriver: user.tripsAsDriver,
        tripsAsPassenger: user.tripsAsPassenger,
        createdAt: user.createdAt,
      },
    };

    res.status(200).json(response);
  }
);

/**
 * @route   PUT /api/users/profile
 * @desc    Mettre à jour le profil de l'utilisateur connecté
 * @access  Private
 */
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const updateData: UpdateProfileData = req.body;
    console.log(updateData);
    const user = await User.findById(req.user?.id);
    console.log(user);
    if (!user) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    // Mettre à jour les champs autorisés
    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.phoneNumber) user.phoneNumber = updateData.phoneNumber;
    if (updateData.bio !== undefined) user.bio = updateData.bio;
    if (updateData.cin !== undefined) user.cin = updateData.cin;
    if (updateData.driverLicenseNumber !== undefined) user.driverLicenseNumber = updateData.driverLicenseNumber;
    if (updateData.wilaya !== undefined) user.wilaya = updateData.wilaya;
    
    // Mettre à jour le véhicule
    if (updateData.vehicle !== undefined) {
      user.vehicle = {
        brand: updateData.vehicle.brand || '',
        model: updateData.vehicle.model || '',
        year: updateData.vehicle.year,
        color: updateData.vehicle.color,
        licensePlate: updateData.vehicle.licensePlate,
      };
    }

    await user.save();

    const response: SuccessResponse = {
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        bio: user.bio,
        cin: user.cin,
        driverLicenseNumber: user.driverLicenseNumber,
        vehicle: user.vehicle,
        rating: user.rating,
        wilaya: user.wilaya,
        createdAt: user.createdAt,
      },
      message: 'Profil mis à jour avec succès',
    };

    res.status(200).json(response);
  }
);

/**
 * @route   POST /api/users/profile-picture
 * @desc    Uploader une photo de profil
 * @access  Private
 */
export const uploadProfilePicture = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.file) {
      throw ApiError.badRequest('Aucun fichier fourni');
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }
console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);

    // Vérifier si Cloudinary est configuré
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log(process.env.CLOUDINARY_CLOUD_NAME);
      console.log(process.env.CLOUDINARY_API_KEY);
      console.log(process.env.CLOUDINARY_API_SECRET);
      console.warn('⚠️  Cloudinary non configuré - Upload d\'image désactivé');
      throw ApiError.badRequest('L\'upload d\'images n\'est pas configuré. Veuillez contacter l\'administrateur.');
    }

    try {
      // Convertir le buffer en base64
      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      // Upload vers Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        folder: 'covoiturage/profiles',
        public_id: `user_${user._id}`,
        overwrite: true,
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto' },
        ],
      });
      console.log("uploadResponse", uploadResponse);
      // Mettre à jour l'utilisateur
      user.profilePicture = uploadResponse.secure_url;
      await user.save();

      const response: SuccessResponse = {
        success: true,
        data: {
          profilePicture: user.profilePicture,
        },
        message: 'Photo de profil mise à jour avec succès',
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('❌ Erreur upload Cloudinary (détails complets):', {
        message: error.message,
        error: error.error,
        http_code: error.http_code,
        full_error: error
      });
      
      // Message d'erreur plus détaillé
      const errorMessage = error.message || error.error?.message || 'Erreur inconnue lors de l\'upload';
      throw ApiError.internal(`Erreur lors de l'upload de l'image: ${errorMessage}`);
    }
  }
);

/**
 * @route   GET /api/users/:id/trips
 * @desc    Récupérer les trajets d'un utilisateur
 * @access  Public
 */
export const getUserTrips = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { role = 'driver', status = 'active' } = req.query;

    const user = await User.findById(id);

    if (!user) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    let trips;

    if (role === 'driver') {
      // Trajets en tant que conducteur
      trips = await Trip.find({
        driver: id,
        ...(status && { status }),
      })
        .populate('driver', 'firstName lastName profilePicture rating')
        .sort({ departureTime: -1 });
    } else {
      // Trajets en tant que passager
      const bookings = await Booking.find({
        passenger: id,
        status: 'confirmed',
      })
        .populate({
          path: 'trip',
          populate: {
            path: 'driver',
            select: 'firstName lastName profilePicture rating',
          },
        })
        .sort({ createdAt: -1 });

      trips = bookings.map(booking => booking.trip);
    }

    const response: SuccessResponse = {
      success: true,
      data: trips,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/users/:id/reviews
 * @desc    Récupérer les avis d'un utilisateur
 * @access  Public
 */
export const getUserReviews = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    const reviews = await Review.find({ reviewee: id })
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('trip', 'departure destination departureTime')
      .sort({ createdAt: -1 })
      .limit(20);

    const response: SuccessResponse = {
      success: true,
      data: reviews,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   DELETE /api/users/account
 * @desc    Supprimer le compte de l'utilisateur
 * @access  Private
 */
export const deleteAccount = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    // Vérifier qu'il n'y a pas de trajets actifs
    const activeTrips = await Trip.countDocuments({
      driver: user._id,
      status: 'active',
      departureTime: { $gte: new Date() },
    });

    if (activeTrips > 0) {
      throw ApiError.badRequest(
        'Impossible de supprimer le compte. Vous avez des trajets actifs en cours.'
      );
    }

    // Vérifier qu'il n'y a pas de réservations actives
    const activeBookings = await Booking.countDocuments({
      passenger: user._id,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (activeBookings > 0) {
      throw ApiError.badRequest(
        'Impossible de supprimer le compte. Vous avez des réservations actives.'
      );
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(user._id);

    const response: SuccessResponse = {
      success: true,
      data: null,
      message: 'Compte supprimé avec succès',
    };

    res.status(200).json(response);
  }
);

