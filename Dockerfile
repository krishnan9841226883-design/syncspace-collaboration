# ============================================
# SyncSpace — Multi-stage Docker Build
# Builds frontend + backend into a single image
# ============================================

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --production=false
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --production=false
COPY backend/ ./
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS production
WORKDIR /app

# Copy backend dist and deps
COPY backend/package*.json ./
RUN npm ci --production
COPY --from=backend-build /app/backend/dist ./dist

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist ./public

# Copy shared types
COPY shared/ ./shared/

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

CMD ["node", "dist/app.js"]
