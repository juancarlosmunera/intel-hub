# ── Stage 1: build the React frontend ────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install all deps (including devDeps needed for vite build)
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Build the frontend bundle into dist/
COPY . .
RUN npm run build

# ── Stage 2: slim runtime ────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
 && npm cache clean --force

# Copy server code, scripts, and the built frontend
COPY server.js ./
COPY scripts ./scripts
COPY --from=builder /app/dist ./dist

# Persistence layer (mounted as a volume)
RUN mkdir -p /app/data /app/logs
VOLUME ["/app/data"]

# Tunables — override with `-e` or in docker-compose
ENV NODE_ENV=production \
    MEMORY_CAP_MB=4096

EXPOSE 3001

# Run with --expose-gc so the memory manager can trigger GC after eviction
CMD ["node", "--expose-gc", "--max-old-space-size=4096", "server.js"]
