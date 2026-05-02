/**
 * SyncSpace Backend — Global Error Handler
 * Centralized error handling with proper status codes and logging
 */

import type { Request, Response, NextFunction } from 'express';

/** Custom application error with status code */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/** Not Found error (404) */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

/** Forbidden error (403) */
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403);
  }
}

/** Conflict error (409) */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * Global error handling middleware.
 * Must be registered last in Express middleware chain.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error details (never expose to client)
  console.error('[Error]', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      success: false,
      error: 'Cross-origin request blocked',
    });
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body',
    });
    return;
  }

  // Default: Internal Server Error (never leak details)
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred',
  });
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'The requested endpoint does not exist',
  });
}
