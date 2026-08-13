# Base stage for common settings. Debian Chromium is multi-architecture, so
# Apple Silicon/Colima does not need to emulate an AMD64 Chrome image.
FROM node:24-bookworm-slim AS base
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
RUN apt-get update \
    && apt-get install --no-install-recommends -y ca-certificates chromium fonts-liberation fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN mkdir -p /app/data /app/cache /app/chrome-data /app/logs \
    && chown -R node:node /app

# Dependencies stage
FROM base AS dependencies
COPY --chown=node:node package.json yarn.lock .yarnrc.yml ./
COPY --chown=node:node .yarn .yarn
USER node
RUN node .yarn/releases/yarn-4.12.0.cjs install --immutable

# Builder stage
FROM dependencies AS builder
COPY --chown=node:node src/ src/

# Final stage for production
FROM builder AS release
CMD ["node", ".yarn/releases/yarn-4.12.0.cjs", "start"]
