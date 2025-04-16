# Build stage
FROM node:18-alpine as build

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

# Expose port
EXPOSE 80
EXPOSE 443

# Caddy will start automatically using the provided Caddyfile