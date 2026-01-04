# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Update npm to latest and install all dependencies
RUN npm install -g npm@latest
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Stage 2: Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files
COPY package*.json ./

# Update npm to latest and install only production dependencies
# tsx is in dependencies, so it will be installed
RUN npm install -g npm@latest
RUN npm ci --only=production && npm cache clean --force

# Copy built assets and server file from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./

# Create a non-root user
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
