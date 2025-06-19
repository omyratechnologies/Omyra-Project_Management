# Frontend-Backend Connection Guide

## Production Architecture

In production, the application uses nginx as a reverse proxy to route requests between frontend and backend:

```
Browser -> nginx:80 -> {
  /api/*     -> backend:5000
  /socket.io -> backend:5000 (WebSocket)
  /*         -> frontend:80 (static files)
}
```

## Fixed Configuration Issues

### 1. Frontend Environment Variables
- **Development**: `VITE_API_URL=http://localhost:5000/api`
- **Production**: `VITE_API_URL=/api` (relative URL through nginx)

### 2. WebSocket Configuration
- **Development**: `VITE_WS_URL=http://localhost:5000`
- **Production**: `VITE_WS_URL=/` (relative URL through nginx)

### 3. CORS Configuration
- **Backend FRONTEND_URL**: Changed from `http://localhost:8080` to `http://localhost` for production

### 4. Docker Configuration
- Backend exposes port 5000 internally only (`expose: 5000`)
- Frontend serves on internal port 80 (`expose: 80`)
- Nginx is the only service with external port (`ports: 80:80`)

## Testing the Connection

After deploying, test these endpoints:

```bash
# Test frontend (should serve React app)
curl http://localhost/

# Test API endpoints
curl http://localhost/api/health

# Test main health endpoint
curl http://localhost/health

# Test a protected API endpoint (requires auth)
curl http://localhost/api/projects
```

## Deployment Process

1. **Build with correct environment**:
   ```bash
   docker compose -f docker-compose.production.yml up -d --build
   ```

2. **Check container status**:
   ```bash
   docker ps
   ```

3. **Test connectivity**:
   ```bash
   # Test internal connectivity
   docker exec -it omyra-project_management-nginx-1 wget -qO- http://frontend:80
   docker exec -it omyra-project_management-nginx-1 wget -qO- http://backend:5000/health
   ```

4. **Check logs if issues**:
   ```bash
   docker logs omyra-project_management-frontend-1
   docker logs omyra-project_management-backend-1
   docker logs omyra-project_management-nginx-1
   ```

## Troubleshooting

### Frontend Can't Connect to Backend
1. Check if nginx is routing correctly
2. Verify environment variables are set correctly in production build
3. Check browser network tab for failed requests

### WebSocket Connection Issues
1. Ensure nginx has WebSocket proxy configuration
2. Check if Socket.IO is falling back to polling
3. Verify auth token is being passed correctly

### CORS Issues
1. Verify FRONTEND_URL matches the actual domain
2. Check nginx proxy headers are set correctly
3. Ensure withCredentials is set appropriately
