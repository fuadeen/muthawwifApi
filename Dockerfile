# Use an official Node.js runtime as the base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 3000

# Start the Node.js application
CMD ["node", "server.js"]
