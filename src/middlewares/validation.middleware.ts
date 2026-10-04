import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiError } from '../utils/ApiError';

/**
 * Middleware pour valider les requêtes avec express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Exécuter toutes les validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Récupérer les erreurs
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    // Formater les erreurs
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : undefined,
      message: error.msg,
    }));

    next(ApiError.badRequest('Erreur de validation', formattedErrors));
  };
};

