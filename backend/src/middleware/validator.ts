/**
 * SyncSpace Backend — Input Validation Middleware
 * Uses Zod schemas for type-safe request validation
 */

import type { Request, Response, NextFunction } from 'express';
import { z, ZodError, type ZodSchema } from 'zod';

/**
 * Creates middleware that validates request body against a Zod schema.
 * Returns 400 with detailed error messages on validation failure.
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Creates middleware that validates query parameters.
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as typeof req.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}

// ============================================
// Validation Schemas
// ============================================

/** Task creation/update schema */
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be under 200 characters')
    .trim(),
  description: z
    .string()
    .max(5000, 'Description must be under 5000 characters')
    .trim()
    .default(''),
  status: z
    .enum(['todo', 'in_progress', 'review', 'done'])
    .default('todo'),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  assigneeId: z.string().nullable().default(null),
  dueDate: z.string().nullable().default(null),
  estimatedHours: z.number().min(0).max(1000).optional(),
  labels: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().max(50),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      })
    )
    .default([]),
  subtasks: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200),
        completed: z.boolean().default(false),
      })
    )
    .default([]),
});

/** Channel creation schema */
export const channelSchema = z.object({
  name: z
    .string()
    .min(1, 'Channel name is required')
    .max(80, 'Channel name must be under 80 characters')
    .regex(/^[a-z0-9-_]+$/, 'Channel name must be lowercase with hyphens/underscores only')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .trim()
    .default(''),
  type: z.enum(['public', 'private', 'direct']).default('public'),
  memberIds: z.array(z.string()).default([]),
});

/** Message creation schema */
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(10000, 'Message must be under 10000 characters')
    .trim(),
  type: z.enum(['text', 'file', 'system']).default('text'),
  threadId: z.string().optional(),
  mentions: z.array(z.string()).default([]),
});

/** AI request schema */
export const aiSummarizeSchema = z.object({
  text: z
    .string()
    .min(10, 'Text must be at least 10 characters')
    .max(50000, 'Text must be under 50000 characters'),
  type: z.enum(['channel', 'task', 'meeting']).default('channel'),
});

/** Calendar event schema */
export const calendarEventSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).trim().default(''),
  startTime: z.string(),
  endTime: z.string(),
  attendeeIds: z.array(z.string()).default([]),
  isAllDay: z.boolean().default(false),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
});
