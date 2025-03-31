# Production image
FROM node:23-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --only=production

COPY . .

# Expose API port
EXPOSE 8080

# Start the service
CMD ["node", "index.ts"]