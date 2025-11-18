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

# Build the application
RUN pnpm run build

# Production stage - serve static files with nginx
FROM docker.internal.scaleway.com/nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Server stage - for SSE server
FROM docker.internal.scaleway.com/node:22.16.0-alpine AS server

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

EXPOSE 3001

CMD ["node", "--import", "tsx", "server/index.ts"]