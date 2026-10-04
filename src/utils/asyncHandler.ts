import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper pour gérer les erreurs asynchrones dans les controllers
 */
type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

