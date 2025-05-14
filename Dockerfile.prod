# Build stage
FROM node:18-bullseye-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build application
RUN npm run build

# Production stage
FROM node:18-bullseye-slim AS production

# Set working directory
WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy package files and install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from build stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Use non-root user for security
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 CMD [ "node", "-e", "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))" ]

# Start application
CMD ["node", "dist/main.js"]