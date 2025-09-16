# Multi-stage build for production
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build frontend
RUN npm run build:client

# Backend build stage
FROM node:18-alpine AS backend-build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy server source
COPY server/ ./server/

# Build backend
RUN npm run build:server

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built backend
COPY --from=backend-build /app/server/dist ./server/dist
COPY --from=backend-build /app/server/package*.json ./server/

# Copy built frontend
COPY --from=frontend-build /app/dist ./dist

# Copy environment files
COPY .env.example .env

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start command
CMD ["npm", "run", "server"]