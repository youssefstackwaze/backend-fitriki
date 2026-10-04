/**
 * Classe personnalisée pour les erreurs API
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: any[];

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: any[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: any[]) {
    return new ApiError(400, message, true, errors);
  }

  static unauthorized(message: string = 'Vous devez vous connecter pour continuer.') {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Vous n\'avez pas la permission d\'effectuer cette action.') {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'La ressource demandée est introuvable.') {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }

  static internal(message: string = 'Une erreur est survenue. Nos équipes ont été notifiées.') {
    return new ApiError(500, message, false);
  }
}

