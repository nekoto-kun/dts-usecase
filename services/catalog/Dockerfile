FROM node:23.11-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files for better cache utilization
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Create data directory for SQLite and set permissions
RUN mkdir -p data && \
  chmod -R 755 /usr/src/app && \
  # Add non-root user
  addgroup -g 1001 -S appuser && \
  adduser -u 1001 -S appuser -G appuser && \
  chown -R appuser:appuser /usr/src/app

# Expose port the app runs on
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Switch to non-root user
USER appuser

# Command to run the app
CMD ["node", "src/server.js"]