# Build stage
FROM node:20-alpine AS base

RUN npm install -g pnpm && \
    apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./

COPY src/ ./src/
COPY tools/ ./tools/

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS builder
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ENV NODE_ENV=production
RUN pnpm -r build

# Runtime stage
FROM node:20-alpine

RUN apk add --no-cache libstdc++ cairo jpeg pango giflib

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/src/shell ./src/shell
COPY --from=builder /app/src/shared ./src/shared
COPY --from=builder /app/src/apps ./src/apps
COPY --from=builder /app/src/old ./src/old

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

EXPOSE 3000
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})}"

# All systems go
CMD ["node", "src/server/dist/index.js"]
