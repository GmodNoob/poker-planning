# Build stage
FROM docker.internal.scaleway.com/node:22.16.0-alpine AS builder

WORKDIR /app

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the frontend application
RUN pnpm run build

# Production stage - Node.js server serving both API and static files
FROM docker.internal.scaleway.com/node:22.16.0-alpine AS production

WORKDIR /app

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy server code
COPY server ./server
COPY team.config.json ./

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Expose port (default 3001, can be overridden with PORT env var)
EXPOSE 3001

# Start the server
CMD ["node", "--import", "tsx", "server/index.ts"]