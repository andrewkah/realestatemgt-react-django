FROM node:22-alpine

# Set working directory
WORKDIR /frontend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

COPY . .

# Build the React app
RUN npm run build

EXPOSE 3000

# Start the app (use serve to serve the build folder)
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
