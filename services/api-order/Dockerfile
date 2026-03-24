# Stage 1: Prune monorepo to only api-order dependencies
FROM node:22-alpine AS pruner
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
# Set pnpm global directory
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir -p $PNPM_HOME
WORKDIR /app
RUN pnpm add -g turbo@2.3.3
COPY . .
RUN turbo prune --scope=@allkons/api-order --docker

# Stage 2: Build application
FROM node:22-alpine AS builder
RUN apk add --no-cache git openssh-client
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
WORKDIR /app

# Setup SSH for Bitbucket access
RUN mkdir -p -m 0600 ~/.ssh && \
    ssh-keyscan bitbucket.org >> ~/.ssh/known_hosts

# Copy full pruned monorepo and lockfile
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Create .npmrc for hoisted node_modules
RUN echo "node-linker=hoisted" > .npmrc

# Install dependencies (with SSH mount for private Bitbucket repos)
RUN --mount=type=ssh pnpm install --frozen-lockfile

# Build api-order
RUN pnpm turbo run build --filter=@allkons/api-order

# Stage 3: Production runtime
FROM node:22-alpine AS runner
ARG GIT_COMMIT_HASH

RUN apk add --no-cache ca-certificates git tzdata

ENV TZ=Asia/Bangkok
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

WORKDIR /app

USER nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/services/api-order/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/services/api-order/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/services/api-order/run.sh ./run.sh

# Copy required node_modules (production dependencies)
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

RUN chmod +x ./run.sh

EXPOSE 3000

CMD ["./run.sh"]
