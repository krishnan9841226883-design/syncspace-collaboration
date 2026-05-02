/**
 * SyncSpace Backend — Calendar Routes
 * Google Calendar integration for team scheduling
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebase';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth';
import { validateBody, calendarEventSchema } from '../middleware/validator';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();
router.use(authMiddleware);

/** GET /api/calendar/events - List team events */
router.get('/events', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { start, end } = req.query;
    let query: FirebaseFirestore.Query = db.collection('events');
    if (start && typeof start === 'string') query = query.where('startTime', '>=', start);
    if (end && typeof end === 'string') query = query.where('startTime', '<=', end);
    query = query.orderBy('startTime', 'asc');
    const snapshot = await query.get();
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: events });
  } catch (error) { next(error); }
});

/** POST /api/calendar/events - Create a new event */
router.post('/events', validateBody(calendarEventSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const eventId = uuidv4();
    const event = {
      id: eventId,
      ...req.body,
      createdBy: req.user!.uid,
      createdAt: new Date().toISOString(),
    };
    await db.collection('events').doc(eventId).set(event);
    res.status(201).json({ success: true, data: event });
  } catch (error) { next(error); }
});

/** DELETE /api/calendar/events/:id */
router.delete('/events/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const doc = await db.collection('events').doc(req.params.id as string).get();
    if (!doc.exists) throw new NotFoundError('Event');
    await db.collection('events').doc(req.params.id as string).delete();
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) { next(error); }
});

/** POST /api/calendar/meet-link - Generate a Google Meet link */
router.post('/meet-link', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { title } = req.body;
    // Generate a Meet-style link (in production, use Google Calendar API)
    const meetId = uuidv4().slice(0, 12).replace(/(.{3})/g, '$1-').slice(0, -1);
    const meetLink = `https://meet.google.com/${meetId}`;
    res.json({
      success: true,
      data: { meetLink, title: title || 'SyncSpace Meeting' },
    });
  } catch (error) { next(error); }
});

export default router;

