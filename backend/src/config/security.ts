/**
 * SyncSpace Backend — Security Configuration
 * Configures Helmet, CORS, and other security headers
 */

import helmet from 'helmet';
import cors from 'cors';
import type { CorsOptions } from 'cors';

/** Helmet security headers configuration */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: [
        "'self'",
        "https://*.googleapis.com",
        "https://*.firebaseio.com",
        "https://*.firebase.google.com",
        "wss://*.firebaseio.com",
      ],
      frameSrc: ["'self'", "https://*.google.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

/** CORS configuration with strict origin allowlist */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://syncspace-735461384035.us-central1.run.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
  maxAge: 86400, // 24 hours
};

export const corsMiddleware = cors(corsConfig);
