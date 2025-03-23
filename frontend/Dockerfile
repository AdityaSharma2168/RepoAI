FROM node:16-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy application code
COPY . .

# Build for production (uncomment for production build)
# RUN npm run build

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"] 