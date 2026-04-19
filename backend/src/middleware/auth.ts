import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { JWTPayload } from '../types/index';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      logger.warn('Auth rejected — no token provided', { path: req.path, method: req.method });
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    req.user = decoded;
    logger.debug('Token verified', { userId: decoded.userId, path: req.path, method: req.method });
    next();
  } catch (error) {
    logger.warn('Auth rejected — invalid token', { path: req.path, method: req.method, error: (error as Error).message });
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as SignOptions
  );
};

export const generateRefreshToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } as SignOptions
  );
};
