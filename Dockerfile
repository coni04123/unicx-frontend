# -----------------------------------------
# 1️⃣ Build Stage
# -----------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files first (better layer caching)
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Copy environment file for build
COPY .env.production .env

# Build the Next.js app
RUN npm run build

# -----------------------------------------
# 2️⃣ Production Stage
# -----------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy only required files for running the app
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build output and public assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Optional: if you use custom server.js, copy it too
# COPY --from=builder /app/server.js ./server.js

# Expose the port Next.js runs on
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
