# Backend Dockerfile
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Build the application
FROM base AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Build NestJS
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /usr/src/app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy necessary files
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chmod 777 uploads && chown -R nestjs:nodejs uploads

USER nestjs

EXPOSE 10000

CMD ["node", "dist/main.js"]

