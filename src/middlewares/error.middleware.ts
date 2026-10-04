import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ErrorResponse } from '../types';

/**
 * Middleware de gestion des erreurs
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Une erreur est survenue. Veuillez réessayer dans quelques instants.';
  let errors: any[] | undefined;

  // Si c'est une ApiError personnalisée
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } 
  // Erreurs de validation Mongoose
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Certaines informations sont incorrectes. Veuillez vérifier les champs.';
    errors = Object.values((err as any).errors).map((e: any) => {
      // Traduire les messages de validation en français convivial
      let userMessage = e.message;
      if (e.message.includes('required')) {
        userMessage = 'Ce champ est obligatoire';
      } else if (e.message.includes('valid email')) {
        userMessage = 'Adresse email invalide';
      } else if (e.message.includes('minimum')) {
        userMessage = 'La valeur est trop courte';
      }
      return {
        field: e.path,
        message: userMessage,
      };
    });
  }
  // Erreur de duplication MongoDB
  else if ((err as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as any).keyValue)[0];
    if (field === 'email') {
      message = 'Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.';
    } else if (field === 'phone') {
      message = 'Ce numéro de téléphone est déjà utilisé.';
    } else {
      message = `Cette ${field} existe déjà dans notre système.`;
    }
  }
  // Erreur de cast MongoDB (ID invalide)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Les informations fournies sont invalides. Veuillez réessayer.';
  }
  // Erreur JWT
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Votre session a expiré. Veuillez vous reconnecter.';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Votre session a expiré. Veuillez vous reconnecter.';
  }

  // Logger l'erreur en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Erreur:', err);
  }

  // Réponse d'erreur
  const response: ErrorResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };

  // Inclure la stack trace en développement
  if (process.env.NODE_ENV === 'development') {
    (response as any).stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Middleware pour les routes non trouvées
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Route ${req.originalUrl} non trouvée`));
};

