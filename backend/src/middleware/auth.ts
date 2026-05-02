/**
 * SyncSpace Backend — Authentication Middleware
 * Verifies Firebase ID tokens and attaches user info to request
 */

import type { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

/** Extended request with authenticated user data */
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    name: string;
    picture: string;
    role: string;
  };
}

/**
 * Middleware to verify Firebase Authentication tokens.
 * Extracts the Bearer token from Authorization header,
 * verifies it with Firebase Admin, and attaches user info to request.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: No valid authentication token provided',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Token is empty',
    });
    return;
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || decodedToken.email || 'Unknown',
      picture: decodedToken.picture || '',
      role: (decodedToken.role as string) || 'member',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired token',
    });
  }
}

/**
 * Optional auth middleware — does not block unauthenticated requests.
 * Useful for routes that work with or without authentication.
 */
export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      if (token) {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          name: decodedToken.name || '',
          picture: decodedToken.picture || '',
          role: (decodedToken.role as string) || 'member',
        };
      }
    } catch {
      // Silently continue without auth
    }
  }

  next();
}
