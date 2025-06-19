#!/bin/bash

# =============================================================================
# 🚀 Omyra Project Management - Advanced Deployment Script
# =============================================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ SUCCESS:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}❌ ERROR:${NC} $1"
}

# Check if script is run with required permissions
check_requirements() {
    log_info "Checking deployment requirements..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if docker compose is available
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    
    log_success "All requirements met"
}

# Backup current deployment
backup_deployment() {
    log_info "Creating backup of current deployment..."
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup environment file
    if [ -f ".env" ]; then
        cp .env "$BACKUP_DIR/"
        log_success "Environment file backed up"
    fi
    
    # Export current database (if MongoDB is running)
    if docker ps | grep -q mongodb; then
        log_info "Backing up database..."
        docker exec omyra-project_management-mongodb-1 mongodump --db omyra-project-nexus --out /tmp/backup || true
        docker cp omyra-project_management-mongodb-1:/tmp/backup "$BACKUP_DIR/mongodb/" || true
        log_success "Database backup completed"
    fi
    
    log_success "Backup created in $BACKUP_DIR"
}

# Generate SSL certificates
generate_ssl_certificates() {
    log_info "Checking SSL certificates..."
    
    if [ ! -f "ssl/certs/server.crt" ] || [ ! -f "ssl/certs/server.key" ]; then
        log_info "Generating SSL certificates..."
        mkdir -p ssl/certs
        
        if [ -f "ssl_config.conf" ]; then
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout ssl/certs/server.key \
                -out ssl/certs/server.crt \
                -config ssl_config.conf \
                -extensions v3_req 2>/dev/null || {
                log_warning "Failed to generate SSL certificates with config file. Using defaults..."
                openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                    -keyout ssl/certs/server.key \
                    -out ssl/certs/server.crt \
                    -subj "/C=US/ST=State/L=City/O=Organization/CN=pms.omyratech.com"
            }
        else
            log_warning "SSL config file not found. Generating with default settings..."
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout ssl/certs/server.key \
                -out ssl/certs/server.crt \
                -subj "/C=US/ST=State/L=City/O=Organization/CN=pms.omyratech.com"
        fi
        
        # Set proper permissions
        chmod 600 ssl/certs/server.key
        chmod 644 ssl/certs/server.crt
        
        log_success "SSL certificates generated"
    else
        log_success "SSL certificates already exist"
    fi
}

# Load and validate environment variables
load_environment() {
    log_info "Loading environment configuration..."
    
    if [ ! -f ".env" ]; then
        log_error ".env file not found. Creating a template..."
        cat > .env << EOF
# Database
MONGODB_URI=mongodb://mongodb:27017/omyra-project-nexus

# JWT 
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production

# CORS
FRONTEND_URL=https://pms.omyratech.com

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@example.com

EMAIL_DEV_MODE=false
EOF
        log_warning "Template .env file created. Please update it with your actual values."
        exit 1
    fi
    
    # Source environment file
    export $(grep -v '^#' .env | xargs)
    
    log_success "Environment loaded"
}

# Stop current deployment gracefully
stop_current_deployment() {
    log_info "Stopping current deployment..."
    
    if docker compose -f docker-compose.production.yml ps -q | grep -q .; then
        docker compose -f docker-compose.production.yml down --timeout 30
        log_success "Current deployment stopped"
    else
        log_info "No running deployment found"
    fi
}

# Clean up Docker resources
cleanup_docker() {
    log_info "Cleaning up Docker resources..."
    
    # Remove unused containers, networks, images, and build cache
    docker system prune -f > /dev/null 2>&1 || true
    
    # Remove dangling images
    docker image prune -f > /dev/null 2>&1 || true
    
    log_success "Docker cleanup completed"
}

# Deploy the application
deploy_application() {
    log_info "Starting application deployment..."
    
    # Build and start containers
    docker compose --env-file .env -f docker-compose.production.yml up -d --build
    
    log_success "Application containers started"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    local max_attempts=30
    local attempt=1
    local health_endpoint="https://localhost/health"
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts..."
        
        if curl -f -k -s "$health_endpoint" > /dev/null 2>&1; then
            log_success "Application is healthy!"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "Health check failed after $max_attempts attempts"
            log_info "Checking container logs..."
            docker compose -f docker-compose.production.yml logs --tail=20
            return 1
        fi
        
        sleep 10
        ((attempt++))
    done
}

# Display deployment status
show_status() {
    log_info "Deployment Status:"
    echo "==================="
    
    # Show running containers
    docker compose -f docker-compose.production.yml ps
    
    echo ""
    log_info "Application URLs:"
    echo "  🌐 HTTPS: https://pms.omyratech.com"
    echo "  🌐 HTTP:  http://pms.omyratech.com (redirects to HTTPS)"
    echo "  🔍 Health: https://pms.omyratech.com/health"
    echo ""
    
    # Show resource usage
    log_info "Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -5
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    # Stop current deployment
    docker compose -f docker-compose.production.yml down
    
    # Find latest backup
    local latest_backup=$(ls -1t backups/ | head -1)
    
    if [ -n "$latest_backup" ] && [ -d "backups/$latest_backup" ]; then
        log_info "Restoring from backup: $latest_backup"
        
        # Restore environment file
        if [ -f "backups/$latest_backup/.env" ]; then
            cp "backups/$latest_backup/.env" .env
            log_success "Environment file restored"
        fi
        
        # Restore database if backup exists
        if [ -d "backups/$latest_backup/mongodb" ]; then
            log_info "Restoring database..."
            docker compose -f docker-compose.production.yml up -d mongodb
            sleep 10
            docker cp "backups/$latest_backup/mongodb" omyra-project_management-mongodb-1:/tmp/
            docker exec omyra-project_management-mongodb-1 mongorestore --db omyra-project-nexus /tmp/mongodb/omyra-project-nexus/
            log_success "Database restored"
        fi
        
        log_success "Rollback completed"
    else
        log_error "No backup found for rollback"
        exit 1
    fi
}

# Main deployment function
main() {
    echo "🚀 Starting Omyra Project Management Deployment"
    echo "================================================="
    
    # Parse command line arguments
    case "${1:-deploy}" in
        "deploy")
            check_requirements
            backup_deployment
            load_environment
            generate_ssl_certificates
            stop_current_deployment
            cleanup_docker
            deploy_application
            health_check
            show_status
            log_success "🎉 Deployment completed successfully!"
            ;;
        "rollback")
            rollback
            ;;
        "status")
            show_status
            ;;
        "stop")
            stop_current_deployment
            ;;
        "logs")
            docker compose -f docker-compose.production.yml logs -f
            ;;
        "health")
            health_check
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|status|stop|logs|health}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Deploy the application (default)"
            echo "  rollback - Rollback to previous deployment"
            echo "  status   - Show deployment status"
            echo "  stop     - Stop the application"
            echo "  logs     - Show application logs"
            echo "  health   - Perform health check"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
