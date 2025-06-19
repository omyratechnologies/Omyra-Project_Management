# Production Deployment Checklist

## Pre-deployment Checklist

### 1. Environment Configuration
- [ ] Backend `.env` file configured for production
- [ ] Frontend `.env` file configured for production  
- [ ] Database connection string updated for production
- [ ] JWT secret changed from default
- [ ] Email service credentials configured
- [ ] CORS settings updated for production domain

### 2. Security
- [ ] Remove all console.log statements from production code
- [ ] Remove debug/test files from production build
- [ ] Update JWT secret to a strong production key
- [ ] Configure proper CORS policy
- [ ] Enable security headers (helmet.js already configured)
- [ ] Set NODE_ENV=production

### 3. Performance
- [ ] Run production build for frontend (`npm run build`)
- [ ] Run production build for backend (`npm run build`)
- [ ] Optimize images and assets
- [ ] Enable gzip compression
- [ ] Configure CDN if needed

### 4. Database
- [ ] Database backup created
- [ ] Database indexed for performance
- [ ] Seed data configured if needed

### 5. Monitoring & Logging
- [ ] Error logging configured
- [ ] Performance monitoring setup
- [ ] Health check endpoints configured

## Deployment Steps

### Backend Deployment
1. Set environment variables:
   ```bash
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-secure-jwt-secret
   FRONTEND_URL=https://your-production-domain.com
   ```

2. Build and start:
   ```bash
   npm run build
   npm start
   ```

### Frontend Deployment
1. Set environment variables:
   ```bash
   VITE_API_URL=https://your-api-domain.com/api
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Deploy the `dist` folder to your hosting service

## Post-deployment
- [ ] Test all major features
- [ ] Verify authentication works
- [ ] Test email functionality
- [ ] Check all API endpoints
- [ ] Monitor for errors
- [ ] Verify database connections

## Production Files Added
- [ ] `.env.production` files configured
- [ ] `ecosystem.config.js` for PM2 process management
- [ ] `docker-compose.production.yml` for Docker deployment
- [ ] `nginx.production.conf` for web server configuration
- [ ] `deploy.sh` deployment script
- [ ] `test-production.sh` testing script
- [ ] `setup-production.sh` server setup script
- [ ] `PRODUCTION-DEPLOYMENT-GUIDE.md` comprehensive guide

## Quick Start Commands
```bash
# Test production readiness
./test-production.sh

# Deploy to production
./deploy.sh

# Set up production server
./setup-production.sh
```
