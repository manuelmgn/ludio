# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 1. Dependencias (solo se invalida si cambian package.json o package-lock.json)
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --prefer-offline --no-audit --no-fund

# 2. Cliente de Prisma (solo se invalida si cambian schema.prisma o prisma.config.ts)
FROM deps AS prisma-gen
COPY prisma/schema.prisma ./prisma/schema.prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# 3. Contenedor -init para ejecutar migraciones y datos iniciales en producción
FROM prisma-gen AS init
COPY prisma/migrations ./prisma/migrations
COPY prisma/seed.ts ./prisma/seed.ts
CMD ["sh", "-c", "npx prisma migrate deploy && npm run db:seed"]

# 4. Build de Next.js (standalone) reutilizando node_modules sin copiarlos
FROM prisma-gen AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY next.config.ts tsconfig.json postcss.config.mjs ./
COPY public ./public
COPY src ./src
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# 5. Imagen final de producción
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5020
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 5020

CMD ["node", "server.js"]
