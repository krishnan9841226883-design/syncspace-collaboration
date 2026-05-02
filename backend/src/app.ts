/**
 * SyncSpace Backend — Express Application Entry Point
 * Main server configuration with all middleware and routes
 */

import express from 'express';
import dotenv from 'dotenv';
import { helmetConfig, corsMiddleware } from './config/security';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import taskRoutes from './routes/tasks';
import channelRoutes from './routes/channels';
import aiRoutes from './routes/ai';
import calendarRoutes from './routes/calendar';
import analyticsRoutes from './routes/analytics';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// =================== Security Middleware ===================
app.use(helmetConfig);
app.use(corsMiddleware);
app.use(generalLimiter);

// =================== Body Parsing ===================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =================== Request ID & Logging ===================
app.use((req, _res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.headers['x-request-id'] = requestId as string;
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} (${requestId})`);
  next();
});

// =================== Health Check ===================
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'SyncSpace API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// =================== API Routes ===================
app.use('/api/tasks', taskRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/analytics', analyticsRoutes);

// =================== Error Handling (API) ===================
app.use('/api/*', notFoundHandler);
app.use(errorHandler);

// =================== Serve Frontend (Production) ===================
import path from 'path';
if (process.env.NODE_ENV === 'production') {
  const publicDir = path.join(__dirname, '..', 'public');
  app.use(express.static(publicDir));
  
  // SPA catch-all: serve index.html for non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
  console.log(`[SyncSpace] Serving frontend from ${publicDir}`);
}

// =================== Start Server ===================
const HOST = '0.0.0.0';
app.listen(parseInt(String(PORT), 10), HOST, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🚀 SyncSpace API Server               ║
  ║   Running on http://${HOST}:${PORT}        ║
  ║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(20)}  ║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
