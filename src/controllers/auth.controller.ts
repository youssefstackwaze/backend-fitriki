import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import User from '../models/User';
import { Admin } from '../models/admin.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/email';
import { 
  LoginCredentials, 
  SignupCredentials, 
  SuccessResponse,
  AuthRequest 
} from '../types';

/**
 * Controller pour l'authentification
 */

/**
 * @route   POST /api/auth/signup
 * @desc    Inscription avec email et mot de passe
 * @access  Public
 */
export const signup = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password, firstName, lastName, phoneNumber, wilaya }: SignupCredentials = req.body;
console.log('email', email);
console.log('password', password);
console.log('firstName', firstName);
console.log('lastName', lastName);
console.log('phoneNumber', phoneNumber);
console.log('wilaya', wilaya);
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('Un compte avec cet email existe déjà');
    }

    // Créer le nouvel utilisateur
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      wilaya,
      authProvider: 'email',
    });
    // Générer les tokens
    const accessToken = generateAccessToken({
      id: String(user._id),
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      id: String(user._id),
      email: user.email,
    });

    // Sauvegarder le refresh token
    user.refreshToken = refreshToken;
    await user.save();

    const response: SuccessResponse = {
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          bio: user.bio,
          rating: user.rating,
          tripsCount: user.tripsAsDriver + user.tripsAsPassenger,
          createdAt: user.createdAt,
          wilaya: user.wilaya,
        },
        token: accessToken,
        refreshToken,
      },
      message: 'Inscription réussie',
    };

    res.status(201).json(response);
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion avec email et mot de passe (utilisateurs et admins)
 * @access  Public
 */
export const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password }: LoginCredentials = req.body;

    // Vérifier d'abord si c'est un admin
    const admin = await Admin.findOne({ email }).select('+password');
    
    if (admin) {
      // Authentification admin
      if (admin.isBlocked) {
        throw ApiError.forbidden(`Votre compte administrateur est bloqué${admin.blockReason ? ': ' + admin.blockReason : ''}`);
      }

      // Vérifier le mot de passe admin
      const isPasswordValid = await admin.comparePassword(password);
      
      if (!isPasswordValid) {
        throw ApiError.unauthorized('Email ou mot de passe incorrect');
      }

      // Générer les tokens pour admin
      const accessToken = generateAccessToken({
        id: String(admin._id),
        email: admin.email,
        role: 'admin',
      });

      const refreshToken = generateRefreshToken({
        id: String(admin._id),
        email: admin.email,
        role: 'admin',
      });

      // Mettre à jour la dernière connexion
      admin.lastLogin = new Date();
      await admin.save();

      const adminData: any = admin.toObject();
      delete adminData.password;

      const response: SuccessResponse = {
        success: true,
        data: {
          admin: adminData,
          isAdmin: true,
          token: accessToken,
          refreshToken,
        },
        message: 'Connexion administrateur réussie',
      };

      return res.status(200).json(response);
    }

    // Si ce n'est pas un admin, authentification utilisateur normale
    const user = await User.findOne({ email }).select('+password');

    console.log('user', user);
    if (!user) {
      throw ApiError.unauthorized('Email ou mot de passe incorrect');
    }

    // Vérifier que l'utilisateur utilise l'authentification par email
    if (user.authProvider !== 'email') {
      throw ApiError.badRequest(
        `Ce compte utilise l'authentification ${user.authProvider}. Veuillez vous connecter avec ${user.authProvider}.`
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Email ou mot de passe incorrect');
    }

    // Générer les tokens
    const accessToken = generateAccessToken({
      id: String(user._id),
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      id: String(user._id),
      email: user.email,
    });

    // Sauvegarder le refresh token
    user.refreshToken = refreshToken;
    await user.save();

    const response: SuccessResponse = {
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          bio: user.bio,
          rating: user.rating,
          tripsCount: user.tripsAsDriver + user.tripsAsPassenger,
          createdAt: user.createdAt,
          cin: user.cin,
          driverLicenseNumber: user.driverLicenseNumber,
          vehicle: user.vehicle,
          isEmailVerified: user.isEmailVerified,
          wilaya: user.wilaya,
        },
        isAdmin: false,
        token: accessToken,
        refreshToken,
      },
      message: 'Connexion réussie',
    };

    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @access  Private
 */
export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const user = await User.findById(req.user?.id);

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
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        bio: user.bio,
        cin: user.cin,
        driverLicenseNumber: user.driverLicenseNumber,
        vehicle: user.vehicle,
        rating: user.rating,
        tripsCount: user.tripsAsDriver + user.tripsAsPassenger,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        wilaya: user.wilaya,
        createdAt: user.createdAt,
      },
    };

    res.status(200).json(response);
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion
 * @access  Private
 */
export const logout = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    // Supprimer le refresh token
    await User.findByIdAndUpdate(req.user?.id, { refreshToken: null });

    const response: SuccessResponse = {
      success: true,
      data: null,
      message: 'Déconnexion réussie',
    };

    res.status(200).json(response);
  }
);

/**
 * Génère un code de vérification aléatoire de 6 chiffres
 */
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @route   POST /api/auth/send-email-verification
 * @desc    Envoyer un code de vérification par email
 * @access  Private
 */
export const sendEmailVerification = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const user = await User.findById(req.user?.id).select('+emailVerificationCode +emailVerificationExpires');

    if (!user) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    if (user.isEmailVerified) {
      throw ApiError.badRequest('Email déjà vérifié');
    }

    // Générer un code de vérification
    const code = generateVerificationCode();
    user.emailVerificationCode = code;
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Envoyer l'email de vérification
    try {
      await sendVerificationEmail(user.email, code, user.firstName);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      // On continue même si l'envoi échoue, pour permettre de réessayer
    }

    const response: SuccessResponse = {
      success: true,
      data: { message: 'Code de vérification envoyé par email' },
      message: 'Code envoyé avec succès',
    };
    console.log(response);
    console.log("response", response);
    res.status(200).json(response);
  }
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Vérifier l'email avec le code
 * @access  Private
 */
export const verifyEmail = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { code } = req.body;

    if (!code) {
      throw ApiError.badRequest('Code de vérification requis');
    }

    const user = await User.findById(req.user?.id).select('+emailVerificationCode +emailVerificationExpires');

    if (!user) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    if (user.isEmailVerified) {
      throw ApiError.badRequest('Email déjà vérifié');
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpires) {
      throw ApiError.badRequest('Aucun code de vérification en attente');
    }

    if (user.emailVerificationExpires < new Date()) {
      throw ApiError.badRequest('Code expiré, veuillez en demander un nouveau');
    }

    if (user.emailVerificationCode !== code) {
      throw ApiError.badRequest('Code invalide');
    }

    // Marquer l'email comme vérifié
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const response: SuccessResponse = {
      success: true,
      data: { isEmailVerified: true },
      message: 'Email vérifié avec succès',
    };

    res.status(200).json(response);
  }
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Demander un code de réinitialisation de mot de passe
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      throw ApiError.badRequest('Email requis');
    }

    // Chercher l'utilisateur
    const user = await User.findOne({ email }).select('+resetPasswordCode +resetPasswordExpires');

    if (!user) {
      // Pour la sécurité, on renvoie le même message même si l'utilisateur n'existe pas
      const response: SuccessResponse = {
        success: true,
        data: { message: 'Si cet email existe, un code de réinitialisation a été envoyé' },
        message: 'Vérifiez votre email',
      };
      return res.status(200).json(response);
    }

    // Vérifier que c'est un compte avec mot de passe (pas Facebook/Google)
    if (user.authProvider !== 'email') {
      throw ApiError.badRequest(
        `Ce compte utilise l'authentification ${user.authProvider}. Vous ne pouvez pas réinitialiser le mot de passe.`
      );
    }

    // Générer un code de réinitialisation
    const code = generateVerificationCode();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Envoyer l'email de réinitialisation
    try {
      await sendPasswordResetEmail(user.email, code, user.firstName);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      // On continue même si l'envoi échoue
    }

    const response: SuccessResponse = {
      success: true,
      data: { message: 'Code de réinitialisation envoyé par email' },
      message: 'Code envoyé avec succès',
    };

    res.status(200).json(response);
  }
);

/**
 * @route   POST /api/auth/verify-reset-code
 * @desc    Vérifier le code de réinitialisation
 * @access  Public
 */
export const verifyResetCode = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, code } = req.body;

    if (!email || !code) {
      throw ApiError.badRequest('Email et code requis');
    }

    const user = await User.findOne({ email }).select('+resetPasswordCode +resetPasswordExpires');

    if (!user) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    if (!user.resetPasswordCode || !user.resetPasswordExpires) {
      throw ApiError.badRequest('Aucun code de réinitialisation en attente');
    }

    if (user.resetPasswordExpires < new Date()) {
      throw ApiError.badRequest('Code expiré, veuillez en demander un nouveau');
    }

    if (user.resetPasswordCode !== code) {
      throw ApiError.badRequest('Code invalide');
    }

    const response: SuccessResponse = {
      success: true,
      data: { codeValid: true },
      message: 'Code valide',
    };

    res.status(200).json(response);
  }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Réinitialiser le mot de passe avec le code
 * @access  Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      throw ApiError.badRequest('Email, code et nouveau mot de passe requis');
    }

    if (newPassword.length < 6) {
      throw ApiError.badRequest('Le mot de passe doit contenir au moins 6 caractères');
    }

    const user = await User.findOne({ email }).select('+resetPasswordCode +resetPasswordExpires +password');

    if (!user) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    if (!user.resetPasswordCode || !user.resetPasswordExpires) {
      throw ApiError.badRequest('Aucun code de réinitialisation en attente');
    }

    if (user.resetPasswordExpires < new Date()) {
      throw ApiError.badRequest('Code expiré, veuillez en demander un nouveau');
    }

    if (user.resetPasswordCode !== code) {
      throw ApiError.badRequest('Code invalide');
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const response: SuccessResponse = {
      success: true,
      data: { passwordReset: true },
      message: 'Mot de passe réinitialisé avec succès',
    };

    res.status(200).json(response);
  }
);
