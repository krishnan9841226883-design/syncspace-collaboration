# ============================================
# SyncSpace — Multi-stage Docker Build
# Builds frontend + backend into a single image
# ============================================

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
COPY shared/ /app/shared/
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS production
WORKDIR /app

# Copy backend dist and production deps
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY --from=backend-build /app/backend/dist ./dist

# Copy frontend build output
COPY --from=frontend-build /app/frontend/dist ./public

# Copy shared types
COPY shared/ ./shared/

# Set environment
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/app.js"]
