/**
 * SyncSpace Backend — AI Routes
 * Gemini API integration for intelligent features
 */

import { Router } from 'express';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth';
import { validateBody, aiSummarizeSchema } from '../middleware/validator';
import { aiLimiter } from '../middleware/rateLimiter';
import { geminiService } from '../services/gemini.service';

const router = Router();
router.use(authMiddleware);
router.use(aiLimiter);

/** POST /api/ai/summarize */
router.post('/summarize', validateBody(aiSummarizeSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { text, type } = req.body;
    const result = await geminiService.summarize(text, type);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

/** POST /api/ai/generate-tasks */
router.post('/generate-tasks', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.length < 10) {
      res.status(400).json({ success: false, error: 'Text must be at least 10 characters' });
      return;
    }
    const tasks = await geminiService.generateTasks(text);
    res.json({ success: true, data: tasks });
  } catch (error) { next(error); }
});

/** POST /api/ai/smart-search */
router.post('/smart-search', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { query, context = '' } = req.body;
    if (!query || query.length < 3) {
      res.status(400).json({ success: false, error: 'Query must be at least 3 characters' });
      return;
    }
    const result = await geminiService.smartSearch(query, context);
    res.json({ success: true, data: { answer: result } });
  } catch (error) { next(error); }
});

/** GET /api/ai/status */
router.get('/status', (_req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: {
      geminiConfigured: geminiService.isConfigured(),
      features: { summarization: true, taskGeneration: true, smartSearch: true },
    },
  });
});

export default router;
