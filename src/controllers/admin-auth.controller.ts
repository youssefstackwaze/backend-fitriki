import { Response, NextFunction } from 'express';
import { Admin, IAdmin } from '../models/admin.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { SuccessResponse, AuthRequest } from '../types/index';

/**
 * @route   POST /api/admin/auth/login
 * @desc    Connexion admin
 * @access  Public
 */
export const loginAdmin = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;
console.log(email, password);

    // Validation
    if (!email || !password) {
      throw ApiError.badRequest('Email et mot de passe requis');
    }

    // Trouver l'admin avec le mot de passe
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      throw ApiError.unauthorized('Email ou mot de passe incorrect');
    }

    // Vérifier si le compte est actif
    if (!admin.isActive) {
      throw ApiError.forbidden('Votre compte a été désactivé');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Email ou mot de passe incorrect');
    }

    // Mettre à jour la dernière connexion
    admin.lastLogin = new Date();
    await admin.save();

    // Générer les tokens
    const accessToken = generateAccessToken({ 
      id: String(admin._id),
      email: admin.email,
      role: 'admin'
    });
    const refreshToken = generateRefreshToken({ 
      id: String(admin._id),
      email: admin.email,
      role: 'admin'
    });

    // Préparer la réponse (sans le mot de passe)
    const adminData: any = admin.toObject();
    delete adminData.password;

    const response: SuccessResponse = {
      success: true,
      data: {
        admin: adminData,
        accessToken,
        refreshToken,
      },
    };

    res.status(200).json(response);
  }
);

/**
 * @route   POST /api/admin/auth/create-super-admin
 * @desc    Créer le premier super admin (à utiliser une seule fois)
 * @access  Public (mais protégé par une clé secrète)
 */
export const createSuperAdmin = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { email, password, firstName, lastName, phoneNumber, secretKey } = req.body;

    // Vérifier la clé secrète (à définir dans les variables d'environnement)
    if (secretKey !== process.env.SUPER_ADMIN_SECRET_KEY) {
      throw ApiError.forbidden('Clé secrète invalide');
    }

    // Vérifier si un super admin existe déjà
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      throw ApiError.badRequest('Un super admin existe déjà');
    }

    // Créer le super admin
    const superAdmin = await Admin.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role: 'super_admin',
      isActive: true,
    });

    const response: SuccessResponse = {
      success: true,
      message: 'Super admin créé avec succès',
      data: {
        admin: {
          id: superAdmin._id,
          email: superAdmin.email,
          firstName: superAdmin.firstName,
          lastName: superAdmin.lastName,
          role: superAdmin.role,
        },
      },
    };

    res.status(201).json(response);
  }
);

/**
 * @route   GET /api/admin/auth/me
 * @desc    Obtenir les informations de l'admin connecté
 * @access  Private (Admin)
 */
export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const adminId = (req as any).admin?.id;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      throw ApiError.notFound('Admin non trouvé');
    }

    const response: SuccessResponse = {
      success: true,
      data: admin,
    };

    res.status(200).json(response);
  }
);

/**
 * @route   PUT /api/admin/auth/change-password
 * @desc    Changer le mot de passe
 * @access  Private (Admin)
 */
export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const adminId = (req as any).admin?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest('Mot de passe actuel et nouveau mot de passe requis');
    }

    if (newPassword.length < 8) {
      throw ApiError.badRequest('Le nouveau mot de passe doit contenir au moins 8 caractères');
    }

    const admin = await Admin.findById(adminId).select('+password');

    if (!admin) {
      throw ApiError.notFound('Admin non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await admin.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Mot de passe actuel incorrect');
    }

    // Mettre à jour le mot de passe
    admin.password = newPassword;
    await admin.save();

    const response: SuccessResponse = {
      success: true,
      message: 'Mot de passe changé avec succès',
      data: null,
    };

    res.status(200).json(response);
  }
);

