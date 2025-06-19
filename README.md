# 🏢 Omyra Project Management System

A comprehensive project management system built with Node.js, Express, MongoDB, and React.

## ✨ Features

- **Project Management** - Create, track, and manage projects
- **Task Management** - Advanced task tracking with dependencies
- **Team Collaboration** - User roles and permissions
- **Client Portal** - Dedicated client dashboard
- **Real-time Notifications** - Stay updated with project changes
- **Meeting Management** - Schedule and track meetings
- **Confluence Integration** - Knowledge management
- **Admin Dashboard** - System administration
- **Email Notifications** - Automated email alerts
- **SSL Security** - HTTPS encryption support

## � Project Structure

```
omyra-project-nexus/
├── 📚 docs/                    # All documentation organized by category
│   ├── ci-cd/                  # CI/CD pipeline and GitHub Actions docs
│   ├── deployment/             # Production deployment guides
│   ├── troubleshooting/        # Error diagnosis and resolution
│   └── guides/                 # User guides and feature documentation
├── 🛠️ scripts/                # Operational scripts organized by function
│   ├── deployment/             # Deployment and server management
│   ├── ssl/                    # SSL certificate management
│   ├── testing/                # System testing and validation
│   └── monitoring/             # System monitoring and health checks
├── 🖥️ backend/                # Node.js/Express API server
├── 🌐 frontend/               # React frontend application
├── 🔧 nginx/                  # Nginx configuration files
└── 🐳 docker-compose.production.yml  # Production Docker setup
```

## �🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd omyra-project-nexus
   ```

2. **Generate SSL certificates**
   ```bash
   ./scripts/ssl/generate-ssl-certs.sh
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Deploy with Docker**
   ```bash
   ./scripts/deployment/deploy.sh
   ```

5. **Access the application**
   - HTTPS: https://localhost (recommended)
   - HTTP: http://localhost (redirects to HTTPS)

### Production Deployment

For production deployment with Let's Encrypt SSL:

```bash
# Set up SSL certificates (requires domain and sudo access)
sudo ./setup-letsencrypt.sh yourdomain.com admin@yourdomain.com

# Deploy
./deploy.sh
```

## 🔐 SSL Configuration

This application includes comprehensive SSL support:

### For Development
- **Self-signed certificates** generated automatically
- Secure HTTPS development environment
- Browser security warnings (expected for self-signed)

### For Production
- **Let's Encrypt** integration for trusted certificates
- Automatic certificate renewal
- A+ SSL security rating configuration

### SSL Features
- TLS 1.2 and 1.3 support
- HTTP/2 enabled
- Perfect Forward Secrecy (PFS)
- HSTS (HTTP Strict Transport Security)
- Strong cipher suites
- OCSP stapling

📖 **[Complete SSL Setup Guide](SSL-SETUP-GUIDE.md)**

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   React App     │    │   Node.js API   │
│   (SSL/HTTPS)   │◄──►│   (Frontend)    │◄──►│   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │    MongoDB      │
                                               │   (Database)    │
                                               └─────────────────┘
```

## 📂 Project Structure

```
├── backend/                 # Node.js API server
├── frontend/                # React application
├── nginx/                   # Nginx configurations
├── ssl/                     # SSL certificates
├── docker-compose.production.yml
├── generate-ssl-certs.sh    # Self-signed certificate generator
├── setup-letsencrypt.sh     # Let's Encrypt setup
├── deploy.sh                # Deployment script
└── SSL-SETUP-GUIDE.md       # SSL documentation
```

## 🛠️ Technologies

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Nodemailer** - Email notifications

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router** - Navigation

### DevOps
- **Docker** - Containerization
- **Nginx** - Reverse proxy and SSL termination
- **Let's Encrypt** - SSL certificates
- **PM2** - Process management

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/omyra-project

# JWT
JWT_SECRET=your-super-secure-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://localhost

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### SSL Configuration

The application automatically detects and configures SSL:

- **Development**: Self-signed certificates generated automatically
- **Production**: Use Let's Encrypt for trusted certificates

## 📊 Monitoring & Health Checks

### Health Endpoints
- HTTP: `http://localhost/health`
- HTTPS: `https://localhost/health`

### SSL Monitoring
```bash
# Check certificate expiration
openssl x509 -in ssl/certs/server.crt -noout -dates

# Test SSL configuration
curl -I https://localhost --insecure
```

## 🔒 Security Features

- **HTTPS Encryption** - All traffic encrypted with SSL/TLS
- **JWT Authentication** - Secure token-based auth
- **Role-based Access Control** - User permissions and roles
- **Input Validation** - Request sanitization
- **Rate Limiting** - API abuse prevention
- **Security Headers** - XSS, CSRF protection
- **CORS Configuration** - Cross-origin security

## 📚 Documentation & Scripts

### 📖 Documentation
All documentation is organized in the `docs/` directory:

- **📋 [docs/README.md](docs/README.md)** - Complete documentation index
- **🚀 [docs/ci-cd/](docs/ci-cd/)** - CI/CD pipeline and GitHub Actions
- **🏗️ [docs/deployment/](docs/deployment/)** - Production deployment guides  
- **🔧 [docs/troubleshooting/](docs/troubleshooting/)** - Error diagnosis and fixes
- **📖 [docs/guides/](docs/guides/)** - User guides and feature docs

### 🛠️ Scripts
All operational scripts are organized in the `scripts/` directory:

- **📋 [scripts/README.md](scripts/README.md)** - Complete scripts index
- **🚀 [scripts/deployment/](scripts/deployment/)** - Deployment automation
- **🔒 [scripts/ssl/](scripts/ssl/)** - SSL certificate management
- **🧪 [scripts/testing/](scripts/testing/)** - System testing and validation
- **📊 [scripts/monitoring/](scripts/monitoring/)** - System monitoring

### 🎯 Quick Navigation
| Need to... | Check... |
|------------|----------|
| Deploy to production | [docs/deployment/](docs/deployment/) + [scripts/deployment/](scripts/deployment/) |
| Fix system errors | [docs/troubleshooting/](docs/troubleshooting/) + [scripts/testing/](scripts/testing/) |
| Set up SSL | [docs/troubleshooting/SSL-SETUP-GUIDE.md](docs/troubleshooting/SSL-SETUP-GUIDE.md) + [scripts/ssl/](scripts/ssl/) |
| Configure CI/CD | [docs/ci-cd/](docs/ci-cd/) |
| Test the system | [docs/guides/TESTING-GUIDE.md](docs/guides/TESTING-GUIDE.md) + [scripts/testing/](scripts/testing/) |

## 📖 Documentation

- [SSL Setup Guide](SSL-SETUP-GUIDE.md)
- [Production Deployment Guide](PRODUCTION-DEPLOYMENT-GUIDE.md)
- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)

## 🐛 Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   ```bash
   # Regenerate certificates
   rm -rf ssl/certs/*
   ./generate-ssl-certs.sh
   ```

2. **Port Already in Use**
   ```bash
   # Find and stop conflicting processes
   sudo lsof -i :443
   sudo lsof -i :80
   ```

3. **Docker Issues**
   ```bash
   # Clean up Docker
   docker-compose -f docker-compose.production.yml down
   docker system prune -f
   ```

### Logs

```bash
# View application logs
docker-compose -f docker-compose.production.yml logs -f

# View specific service logs
docker-compose -f docker-compose.production.yml logs nginx
docker-compose -f docker-compose.production.yml logs backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation files
- Review troubleshooting section
- Create an issue in the repository

---

**🔐 Security Note**: This application uses HTTPS by default. For production deployments, ensure you use certificates from a trusted Certificate Authority like Let's Encrypt.
