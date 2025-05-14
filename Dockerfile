# Step 1: Use a Node image to build the app
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Increase Node.js memory limit to avoid heap crashes
ENV NODE_OPTIONS=--max-old-space-size=2048

# Copy package.json and package-lock.json
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Run Vite build command to generate production files
RUN npm run build

# Step 2: Use an Nginx image to serve the app
FROM nginx:alpine

# Copy the build folder to Nginx's default HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to be able to access the app
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
