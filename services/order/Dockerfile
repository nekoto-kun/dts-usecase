FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Create data directory for SQLite
RUN mkdir -p data

# Set appropriate permissions
RUN chmod -R 755 /usr/src/app

# Expose port the app runs on
EXPOSE 8080

# Command to run the app
CMD ["node", "src/server.js"]