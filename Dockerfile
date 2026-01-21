# ========================================
# Multi-Stage Dockerfile for Next.js 15
# with Prisma and MongoDB
# ========================================

ARG NODE_VERSION=20.18.0

# ========================================
# Dependencies Stage
# ========================================
FROM node:${NODE_VERSION}-alpine AS deps

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --omit=dev && \
    npm cache clean --force

# ========================================
# Build Dependencies Stage
# ========================================
FROM node:${NODE_VERSION}-alpine AS build-deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies including devDependencies
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci && \
    npm cache clean --force

# ========================================
# Build Stage
# ========================================
FROM node:${NODE_VERSION}-alpine AS build

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy dependencies from build-deps
COPY --from=build-deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
# This will create .next/standalone with minimal dependencies
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ========================================
# Production Stage
# ========================================
FROM node:${NODE_VERSION}-alpine AS production

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0

# Copy necessary files from build stage
# Standalone mode includes only necessary node_modules
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

# Copy Prisma schema and generated client
COPY --from=build --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
