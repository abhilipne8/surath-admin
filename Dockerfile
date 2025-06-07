# Step 1: Use a Node image to build the app
FROM node:18-alpine AS build

WORKDIR /app
ENV NODE_OPTIONS=--max-old-space-size=2048

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Use an Nginx image to serve the app
FROM nginx:alpine

# Copy the build output to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
