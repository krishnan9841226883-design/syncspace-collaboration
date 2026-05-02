/**
 * SyncSpace Backend — Task Routes
 * CRUD operations for task management with real-time Firestore
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebase';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth';
import { validateBody, taskSchema } from '../middleware/validator';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

/**
 * GET /api/tasks
 * Retrieve all tasks for the workspace, with optional filters
 */
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status, priority, assigneeId, page = '1', limit = '50' } = req.query;
    
    let query: FirebaseFirestore.Query = db.collection('tasks');

    // Apply filters
    if (status && typeof status === 'string') {
      query = query.where('status', '==', status);
    }
    if (priority && typeof priority === 'string') {
      query = query.where('priority', '==', priority);
    }
    if (assigneeId && typeof assigneeId === 'string') {
      query = query.where('assigneeId', '==', assigneeId);
    }

    // Order by creation date
    query = query.orderBy('order', 'asc').orderBy('createdAt', 'desc');

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const pageSize = Math.min(parseInt(limit as string, 10), 100);
    const offset = (pageNum - 1) * pageSize;

    const snapshot = await query.limit(pageSize).offset(offset).get();
    
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count for pagination
    const countSnapshot = await db.collection('tasks').count().get();
    const total = countSnapshot.data().count;

    res.json({
      success: true,
      data: tasks,
      total,
      page: pageNum,
      pageSize,
      hasMore: offset + pageSize < total,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tasks/:id
 * Retrieve a single task by ID
 */
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const doc = await db.collection('tasks').doc(req.params.id as string).get();
    
    if (!doc.exists) {
      throw new NotFoundError('Task');
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', validateBody(taskSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const taskId = uuidv4();
    const now = new Date().toISOString();

    const task = {
      ...req.body,
      id: taskId,
      creatorId: req.user!.uid,
      attachments: [],
      createdAt: now,
      updatedAt: now,
      order: Date.now(),
    };

    await db.collection('tasks').doc(taskId).set(task);

    // Log activity
    await db.collection('activities').add({
      userId: req.user!.uid,
      userName: req.user!.name,
      userPhoto: req.user!.picture,
      action: 'created task',
      targetType: 'task',
      targetId: taskId,
      targetName: task.title,
      timestamp: now,
    });

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/tasks/:id
 * Update an existing task
 */
router.put('/:id', validateBody(taskSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const taskRef = db.collection('tasks').doc(req.params.id as string);
    const doc = await taskRef.get();
    
    if (!doc.exists) {
      throw new NotFoundError('Task');
    }

    const now = new Date().toISOString();
    const updates = {
      ...req.body,
      updatedAt: now,
      ...(req.body.status === 'done' ? { completedAt: now } : {}),
    };

    await taskRef.update(updates);

    // Log activity
    await db.collection('activities').add({
      userId: req.user!.uid,
      userName: req.user!.name,
      userPhoto: req.user!.picture,
      action: 'updated task',
      targetType: 'task',
      targetId: req.params.id as string,
      targetName: req.body.title || doc.data()?.title,
      timestamp: now,
    });

    res.json({
      success: true,
      data: { id: req.params.id as string, ...doc.data(), ...updates },
      message: 'Task updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/tasks/:id/status
 * Quick status update for a task (used for drag-and-drop)
 */
router.patch('/:id/status', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status, order } = req.body;
    const taskRef = db.collection('tasks').doc(req.params.id as string);
    const doc = await taskRef.get();

    if (!doc.exists) {
      throw new NotFoundError('Task');
    }

    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      status,
      updatedAt: now,
    };

    if (order !== undefined) {
      updates.order = order;
    }

    if (status === 'done') {
      updates.completedAt = now;
    }

    await taskRef.update(updates);

    res.json({
      success: true,
      data: { id: req.params.id as string, ...doc.data(), ...updates },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const taskRef = db.collection('tasks').doc(req.params.id as string);
    const doc = await taskRef.get();
    
    if (!doc.exists) {
      throw new NotFoundError('Task');
    }

    await taskRef.delete();

    // Log activity
    await db.collection('activities').add({
      userId: req.user!.uid,
      userName: req.user!.name,
      userPhoto: req.user!.picture,
      action: 'deleted task',
      targetType: 'task',
      targetId: req.params.id as string,
      targetName: doc.data()?.title || 'Unknown',
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

