/**
 * SyncSpace Backend — Channel Routes
 * Channel and messaging management with real-time Firestore
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebase';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth';
import { validateBody, channelSchema, messageSchema } from '../middleware/validator';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);

/**
 * GET /api/channels
 * List all channels the user has access to
 */
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    // Get public channels + channels where user is a member
    const publicChannels = await db
      .collection('channels')
      .where('type', '==', 'public')
      .orderBy('lastMessageAt', 'desc')
      .get();

    const memberChannels = await db
      .collection('channels')
      .where('memberIds', 'array-contains', req.user!.uid)
      .orderBy('lastMessageAt', 'desc')
      .get();

    // Merge and deduplicate
    const channelMap = new Map<string, FirebaseFirestore.DocumentData>();
    publicChannels.docs.forEach((doc) => {
      channelMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    memberChannels.docs.forEach((doc) => {
      channelMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    const channels = Array.from(channelMap.values());

    res.json({
      success: true,
      data: channels,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/channels
 * Create a new channel
 */
router.post('/', validateBody(channelSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const channelId = uuidv4();
    const now = new Date().toISOString();

    const channel = {
      id: channelId,
      ...req.body,
      memberIds: [...new Set([req.user!.uid, ...(req.body.memberIds || [])])],
      createdBy: req.user!.uid,
      createdAt: now,
      lastMessageAt: now,
    };

    await db.collection('channels').doc(channelId).set(channel);

    // Post system message
    await db.collection('channels').doc(channelId).collection('messages').add({
      senderId: 'system',
      senderName: 'SyncSpace',
      senderPhoto: '',
      content: `Channel #${channel.name} was created by ${req.user!.name}`,
      type: 'system',
      attachments: [],
      reactions: {},
      mentions: [],
      createdAt: now,
    });

    res.status(201).json({
      success: true,
      data: channel,
      message: 'Channel created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/channels/:id/messages
 * Get messages for a channel with pagination
 */
router.get('/:id/messages', async (req: AuthenticatedRequest, res, next) => {
  try {
    const channelDoc = await db.collection('channels').doc(req.params.id).get();
    
    if (!channelDoc.exists) {
      throw new NotFoundError('Channel');
    }

    const channelData = channelDoc.data()!;
    
    // Check access for private channels
    if (channelData.type === 'private' && !channelData.memberIds.includes(req.user!.uid)) {
      throw new ForbiddenError('You do not have access to this channel');
    }

    const { limit = '50', before } = req.query;
    const pageSize = Math.min(parseInt(limit as string, 10), 100);

    let query = db
      .collection('channels')
      .doc(req.params.id)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(pageSize);

    if (before && typeof before === 'string') {
      query = query.where('createdAt', '<', before);
    }

    const snapshot = await query.get();
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      channelId: req.params.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/channels/:id/messages
 * Send a message to a channel
 */
router.post('/:id/messages', validateBody(messageSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const channelRef = db.collection('channels').doc(req.params.id);
    const channelDoc = await channelRef.get();
    
    if (!channelDoc.exists) {
      throw new NotFoundError('Channel');
    }

    const now = new Date().toISOString();
    const messageId = uuidv4();

    const message = {
      id: messageId,
      channelId: req.params.id,
      senderId: req.user!.uid,
      senderName: req.user!.name,
      senderPhoto: req.user!.picture,
      ...req.body,
      attachments: [],
      reactions: {},
      createdAt: now,
    };

    await channelRef.collection('messages').doc(messageId).set(message);

    // Update channel's last message timestamp
    await channelRef.update({ lastMessageAt: now });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/channels/:id/join
 * Join a channel
 */
router.post('/:id/join', async (req: AuthenticatedRequest, res, next) => {
  try {
    const channelRef = db.collection('channels').doc(req.params.id);
    const channelDoc = await channelRef.get();

    if (!channelDoc.exists) {
      throw new NotFoundError('Channel');
    }

    const channelData = channelDoc.data()!;

    if (channelData.type === 'private') {
      throw new ForbiddenError('Cannot join a private channel without an invitation');
    }

    const memberIds = channelData.memberIds || [];
    if (!memberIds.includes(req.user!.uid)) {
      memberIds.push(req.user!.uid);
      await channelRef.update({ memberIds });
    }

    res.json({
      success: true,
      message: 'Joined channel successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
