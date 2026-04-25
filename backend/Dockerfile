# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
RUN apk upgrade --no-cache
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN chmod -R 755 node_modules/.bin && npm run build

# ── Stage 2: Production image ────────────────────────────────────────────────
FROM node:24-alpine

RUN apk upgrade --no-cache

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Cloud Run mounts the Cloud SQL Auth Proxy Unix socket under /cloudsql
# when --add-cloudsql-instances is set on the service.
# The directory must exist and be writable before the proxy socket appears.
RUN mkdir -p /cloudsql && chown nodejs:nodejs /cloudsql /app

USER nodejs

# Cloud Run injects PORT at runtime (default 8080).
# Our app already reads process.env.PORT via config.port.
EXPOSE 8080

CMD ["node", "dist/index.js"]
