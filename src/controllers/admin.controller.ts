import { Response, NextFunction } from 'express';
import { Admin } from '../models/admin.model';
import User from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest, SuccessResponse } from '../types/index';
import { sendAdminCredentialsEmail } from '../config/email';
import { getCommissionRate } from '../config/constants';

/**
 * @route   POST /api/admin/admins
 * @desc    Créer un nouvel administrateur (Super Admin seulement)
 * @access  Private (Super Admin)
 */
export const createAdmin = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { email, password, firstName, lastName, role, wilaya } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      throw ApiError.badRequest('Veuillez remplir tous les champs requis');
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      throw ApiError.badRequest('Un administrateur avec cet email existe déjà');
    }

    // Sauvegarder le mot de passe original avant le hashing pour l'email
    const originalPassword = password;

    const adminData: any = {
      email,
      password,
      firstName,
      lastName,
      role,
      isActive: true,
      isBlocked: false,
    };

    // Ajouter la zone si une wilaya est fournie
    if (wilaya) {
      adminData.zone = {
        wilaya,
        cities: [], // Peut être étendu plus tard
      };
    }

    const admin = await Admin.create(adminData);

    // Envoyer l'email avec les identifiants (ne pas bloquer si l'email échoue)
    try {
      await sendAdminCredentialsEmail(
        email,
        firstName,
        lastName,
        email,
        originalPassword,
        role,
        wilaya
      );
    } catch (emailError) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email:', emailError);
      // On continue quand même, l'admin est créé
    }

    const adminResponse: any = admin.toObject();
    delete adminResponse.password;

    const response: SuccessResponse = {
      success: true,
      message: 'Administrateur créé avec succès. Un email a été envoyé avec les identifiants.',
      data: adminResponse,
    };

    res.status(201).json(response);
  }
);

/**
 * @route   GET /api/admin/admins
 * @desc    Obtenir tous les administrateurs (Super Admin seulement)
 * @access  Private (Super Admin)
 */
export const getAdmins = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const admins = await Admin.find().select('-password');

    const response: SuccessResponse = {
      success: true,
      data: admins,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   DELETE /api/admin/admins/:id
 * @desc    Supprimer un administrateur
 * @access  Private (Super Admin seulement)
 */
export const deleteAdmin = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const currentAdminId = req.admin?.id;

    // Trouver l'admin à supprimer
    const adminToDelete = await Admin.findById(id);

    if (!adminToDelete) {
      throw ApiError.notFound('Administrateur non trouvé');
    }

    // Empêcher la suppression de son propre compte
    if ((adminToDelete._id as any).toString() === currentAdminId) {
      throw ApiError.badRequest('Vous ne pouvez pas supprimer votre propre compte');
    }

    // Supprimer l'admin
    await Admin.findByIdAndDelete(id);

    const response: SuccessResponse = {
      success: true,
      message: 'Administrateur supprimé avec succès',
      data: {
        id: adminToDelete._id,
        email: adminToDelete.email,
        firstName: adminToDelete.firstName,
        lastName: adminToDelete.lastName,
        role: adminToDelete.role,
      },
    };

    res.status(200).json(response);
  }
);

/**
 * @route   PUT /api/admin/admins/:id/block
 * @desc    Bloquer/Débloquer un administrateur (Super Admin seulement)
 * @access  Private (Super Admin)
 */
export const toggleBlockAdmin = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { isBlocked, blockReason } = req.body;

    const admin = await Admin.findById(id);

    if (!admin) {
      throw ApiError.notFound('Administrateur non trouvé');
    }

    if ((admin._id as any).toString() === req.admin?.id) {
      throw ApiError.badRequest('Vous ne pouvez pas bloquer votre propre compte');
    }

    admin.isBlocked = isBlocked;
    admin.blockReason = isBlocked ? blockReason : undefined;
    await admin.save();

    const response: SuccessResponse = {
      success: true,
      message: `Administrateur ${isBlocked ? 'bloqué' : 'débloqué'} avec succès`,
      data: admin,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/admin/users
 * @desc    Obtenir tous les utilisateurs (Admin, Super Admin)
 * @access  Private (Admin, Super Admin)
 */
export const getUsers = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const adminRole = req.admin?.role;
    const adminZone = req.admin?.zone;

    // Construire le filtre
    let filter: any = {};

    // Si l'admin n'est pas super_admin et a une wilaya assignée, filtrer par wilaya
    if (adminRole !== 'super_admin' && adminZone?.wilaya) {
      filter.wilaya = adminZone.wilaya;
    }

    const users = await User.find(filter).select('-password -refreshToken');

    const response: SuccessResponse = {
      success: true,
      data: users,
      message: adminRole !== 'super_admin' && adminZone?.wilaya 
        ? `Utilisateurs de la wilaya ${adminZone.wilaya}` 
        : 'Tous les utilisateurs',
    };

    res.status(200).json(response);
  }
);

/**
 * @route   PUT /api/admin/users/:id/block
 * @desc    Bloquer/Débloquer un utilisateur (Admin, Super Admin)
 * @access  Private (Admin, Super Admin)
 */
export const toggleBlockUser = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { isBlocked, blockReason } = req.body;
    const adminRole = req.admin?.role;
    const adminZone = req.admin?.zone;

    const user = await User.findById(id);

    if (!user) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    // Vérifier que l'admin a le droit de bloquer cet utilisateur
    if (adminRole !== 'super_admin' && adminZone?.wilaya) {
      if (user.wilaya !== adminZone.wilaya) {
        throw ApiError.forbidden(
          `Vous ne pouvez gérer que les utilisateurs de votre wilaya (${adminZone.wilaya})`
        );
      }
    }

    user.isBlocked = isBlocked;
    user.blockReason = isBlocked ? blockReason : undefined;
    await user.save();

    const response: SuccessResponse = {
      success: true,
      message: `Utilisateur ${isBlocked ? 'bloqué' : 'débloqué'} avec succès`,
      data: user,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/admin/users/:id/stats
 * @desc    Obtenir les statistiques détaillées d'un utilisateur
 * @access  Private (Admin, Super Admin)
 */
export const getUserStats = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { month, year } = req.query;
    const adminRole = req.admin?.role;
    const adminZone = req.admin?.zone;

    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    // Vérifier que l'admin a le droit de voir les statistiques de cet utilisateur
    if (adminRole !== 'super_admin' && adminZone?.wilaya) {
      if (user.wilaya !== adminZone.wilaya) {
        throw ApiError.forbidden(
          `Vous ne pouvez consulter que les utilisateurs de votre wilaya (${adminZone.wilaya})`
        );
      }
    }

    // Importer les modèles nécessaires
    const Trip = (await import('../models/Trip')).default;
    const Booking = (await import('../models/Booking')).default;

    // Filtres de date si fournis
    const dateFilter: any = {};
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      dateFilter.departureTime = { $gte: startDate, $lte: endDate };
    }

    // Statistiques en tant que conducteur
    const tripsAsDriver = await Trip.find({ 
      driver: id,
      ...dateFilter 
    });
console.log("tripsAsDriver: " + tripsAsDriver);

    // Récupérer le taux de commission dynamique
    const commissionRate = await getCommissionRate();
    
    let totalRevenue = 0;
    let totalCommission = 0;
    let completedTrips = 0;
    let cancelledTrips = 0;
    const citiesStats: any = {};

    for (const trip of tripsAsDriver) {
      if (trip.status === 'completed') {
        console.log("trip: " + trip);
        completedTrips++;
        const bookings = await Booking.find({ 
          trip: trip._id, 
          status: 'completed' 
        });
        
        for (const booking of bookings) {
          totalRevenue += booking.totalPrice;
          // Utiliser le taux de commission dynamique
          const commission = booking.totalPrice * commissionRate;
          totalCommission += commission;
        }
      }
      
      if (trip.status === 'cancelled') {
        cancelledTrips++;
      }

      // Statistiques par ville
      const departureCity = trip.departure?.city || 'Inconnu';
      const destinationCity = trip.destination?.city || 'Inconnu';
      const route = `${departureCity} → ${destinationCity}`;
      
      if (!citiesStats[route]) {
        citiesStats[route] = { count: 0, revenue: 0 };
      }
      citiesStats[route].count++;
    }

    // Statistiques en tant que passager
    const bookingsAsPassenger = await Booking.find({ 
      passenger: id 
    }).populate('trip');

    let totalSpent = 0;
    let completedBookings = 0;
    let cancelledBookings = 0;

    for (const booking of bookingsAsPassenger) {
      if (booking.status === 'confirmed') {
        completedBookings++;
        totalSpent += booking.totalPrice;
      }
      if (booking.status === 'cancelled') {
        cancelledBookings++;
      }
    }

    const stats = {
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        rating: user.rating,
      },
      asDriver: {
        totalTrips: tripsAsDriver.length,
        completedTrips,
        cancelledTrips,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        netRevenue: Math.round((totalRevenue - totalCommission) * 100) / 100,
        citiesStats: Object.entries(citiesStats)
          .sort(([, a]: any, [, b]: any) => b.count - a.count)
          .slice(0, 10)
          .map(([route, data]: any) => ({ route, ...data })),
      },
      asPassenger: {
        totalBookings: bookingsAsPassenger.length,
        completedBookings,
        cancelledBookings,
        totalSpent: Math.round(totalSpent * 100) / 100,
      },
      summary: {
        totalCancellations: cancelledTrips + cancelledBookings,
        cancellationRate: tripsAsDriver.length > 0 
          ? Math.round((cancelledTrips / tripsAsDriver.length) * 100) 
          : 0,
      }
    };

    const response: SuccessResponse = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  }
);
