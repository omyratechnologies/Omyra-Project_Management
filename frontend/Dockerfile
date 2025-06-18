# ================================
# Step 1: Build the React (Vite) app
# ================================
FROM node:18-alpine AS builder

WORKDIR /app
COPY . .
RUN npm install && npm run build

# ================================
# Step 2: Serve with NGINX
# ================================
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

