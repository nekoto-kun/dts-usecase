# Build stage
FROM node:23.11-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app source
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM caddy:2-alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/caddy

# Copy Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Copy runtime configuration script
COPY config-env.sh /config-env.sh
RUN chmod +x /config-env.sh

# Expose port
EXPOSE 80
EXPOSE 443

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

# Use our script as entrypoint
ENTRYPOINT ["/config-env.sh"]