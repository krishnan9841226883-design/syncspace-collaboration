/**
 * SyncSpace Backend — Analytics Routes
 * Team productivity analytics and reporting
 */

import { Router } from 'express';
import { db } from '../config/firebase';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

/** GET /api/analytics/team - Team analytics dashboard data */
router.get('/team', async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [tasksSnap, activitiesSnap] = await Promise.all([
      db.collection('tasks').get(),
      db.collection('activities').orderBy('timestamp', 'desc').limit(50).get(),
    ]);

    const tasks = tasksSnap.docs.map((d) => d.data());
    const tasksByStatus: Record<string, number> = { todo: 0, in_progress: 0, review: 0, done: 0 };
    const tasksByPriority: Record<string, number> = { low: 0, medium: 0, high: 0, urgent: 0 };
    const tasksByMember: Record<string, number> = {};
    let overdueTasks = 0;

    tasks.forEach((t) => {
      tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
      tasksByPriority[t.priority] = (tasksByPriority[t.priority] || 0) + 1;
      if (t.assigneeId) tasksByMember[t.assigneeId] = (tasksByMember[t.assigneeId] || 0) + 1;
      if (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done') overdueTasks++;
    });

    const analytics = {
      totalTasks: tasks.length,
      completedTasks: tasksByStatus.done || 0,
      overdueTasks,
      tasksByStatus,
      tasksByPriority,
      tasksByMember,
      activeMembers: Object.keys(tasksByMember).length,
      totalMessages: 0,
      recentActivities: activitiesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };

    res.json({ success: true, data: analytics });
  } catch (error) { next(error); }
});

/** GET /api/analytics/activity - Recent activity feed */
router.get('/activity', async (_req: AuthenticatedRequest, res, next) => {
  try {
    const snapshot = await db.collection('activities')
      .orderBy('timestamp', 'desc')
      .limit(30)
      .get();
    const activities = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ success: true, data: activities });
  } catch (error) { next(error); }
});

export default router;
