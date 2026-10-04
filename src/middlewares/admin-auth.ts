import { Response, NextFunction } from 'express';
import { Admin } from '../models/admin.model';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../types/index';
import { verifyAccessToken } from '../utils/jwt';

/**
 * Middleware pour vérifier l'authentification admin
 */
export const protectAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Récupérer le token depuis le header Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('Accès non autorisé - Token manquant');
    }

    // Vérifier le token
    const decoded = verifyAccessToken(token);

    // Vérifier que c'est bien un token admin
    if (decoded.role !== 'admin') {
      throw ApiError.forbidden('Token invalide pour un admin');
    }

    // Trouver l'admin
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      throw ApiError.unauthorized('Admin non trouvé');
    }

    if (admin.isBlocked) {
      throw ApiError.forbidden(`Votre compte a été bloqué${admin.blockReason ? ': ' + admin.blockReason : ''}`);
    }

    // Ajouter les infos admin à la requête
    req.admin = {
      id: (admin._id as any).toString(),
      role: admin.role,
      permissions: [],
      zone: admin.zone,
    };

    next();
  } catch (error: any) {
    if (error.message && error.message.includes('expiré')) {
      next(ApiError.unauthorized('Token expiré'));
    } else if (error.message && error.message.includes('invalide')) {
      next(ApiError.unauthorized('Token invalide'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware pour vérifier les rôles admin
 */
export const authorizeAdmin = (...roles: Array<'super_admin' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const admin = req.admin;

    if (!admin) {
      return next(ApiError.unauthorized('Accès non autorisé'));
    }

    if (!roles.includes(admin.role as any)) {
      return next(
        ApiError.forbidden(
          'Vous n\'avez pas la permission d\'effectuer cette action'
        )
      );
    }

    next();
  };
};
