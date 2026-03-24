# Stage 1: Prune monorepo to only buyer-platform dependencies
FROM node:22-alpine AS pruner
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
# Set pnpm global directory
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir -p $PNPM_HOME
WORKDIR /app
RUN pnpm add -g turbo@2.3.3
COPY . .
RUN turbo prune --scope=@allkons/buyer-platform --docker

# Stage 2: Build application
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
WORKDIR /app

# Copy full pruned monorepo and lockfile
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies in builder stage
RUN pnpm install --frozen-lockfile

# Build args for Next.js environment variables
ARG NEXT_PUBLIC_ALLKONS_API_KEY
ARG NEXT_PUBLIC_API_HOST_URL
ARG NEXT_PUBLIC_GOOGLE_MAP_API_KEY

ENV NEXT_PUBLIC_ALLKONS_API_KEY=${NEXT_PUBLIC_ALLKONS_API_KEY}
ENV NEXT_PUBLIC_API_HOST_URL=${NEXT_PUBLIC_API_HOST_URL}
ENV NEXT_PUBLIC_GOOGLE_MAP_API_KEY=${NEXT_PUBLIC_GOOGLE_MAP_API_KEY}

# Build buyer-platform
RUN pnpm turbo run build --filter=@allkons/buyer-platform

# Stage 3: Production runtime
FROM node:22-alpine AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

USER nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/buyer-platform/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/buyer-platform/.next/static ./apps/buyer-platform/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/buyer-platform/public ./apps/buyer-platform/public

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "apps/buyer-platform/server.js"]
