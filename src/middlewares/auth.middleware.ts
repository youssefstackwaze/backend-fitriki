import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import User from '../models/User';

/**
 * Middleware pour vérifier l'authentification JWT
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Token d\'authentification manquant');
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier et décoder le token
    const decoded = verifyAccessToken(token);

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw ApiError.unauthorized('Utilisateur non trouvé');
    }

    // Attacher l'utilisateur à la requête
    req.user = {
      id: String(user._id),
      email: user.email,
      role: 'user',
    };

    next();
  } catch (error: any) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Token invalide ou expiré'));
    }
  }
};

/**
 * Middleware optionnel pour récupérer l'utilisateur s'il est connecté
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      
      const user = await User.findById(decoded.id);
      
      if (user) {
        req.user = {
          id: String(user._id),
          email: user.email,
          role: 'user',
        };
      }
    }
    
    next();
  } catch (error) {
    // Ignorer les erreurs et continuer sans utilisateur
    next();
  }
};

