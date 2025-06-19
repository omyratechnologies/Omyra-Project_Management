#!/bin/bash

# =============================================================================
# 🔐 Let's Encrypt SSL Certificate Setup for Omyra PMS
# =============================================================================

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if domain is accessible
check_domain_accessibility() {
    log_info "Checking domain accessibility..."
    
    if curl -f -s -I "http://pms.omyratech.com" > /dev/null; then
        log_success "Domain is accessible via HTTP"
        return 0
    else
        log_error "Domain is not accessible. Please ensure:"
        echo "  1. DNS is properly configured"
        echo "  2. Domain points to this server"
        echo "  3. Ports 80 and 443 are open"
        return 1
    fi
}

# Setup Let's Encrypt certificates
setup_letsencrypt() {
    log_info "Setting up Let's Encrypt SSL certificates..."
    
    # Stop nginx temporarily
    docker compose -f docker-compose.production.yml stop nginx
    
    # Get certificates using standalone mode
    sudo certbot certonly \
        --standalone \
        --agree-tos \
        --no-eff-email \
        --email admin@omyratech.com \
        -d pms.omyratech.com \
        --non-interactive
    
    if [ $? -eq 0 ]; then
        log_success "Let's Encrypt certificates obtained successfully"
        
        # Copy certificates to our ssl directory
        sudo mkdir -p ssl/certs/letsencrypt
        sudo cp /etc/letsencrypt/live/pms.omyratech.com/fullchain.pem ssl/certs/letsencrypt/
        sudo cp /etc/letsencrypt/live/pms.omyratech.com/privkey.pem ssl/certs/letsencrypt/
        sudo chown -R $USER:$USER ssl/certs/letsencrypt/
        
        return 0
    else
        log_error "Failed to obtain Let's Encrypt certificates"
        return 1
    fi
}

# Create production nginx config with Let's Encrypt
create_letsencrypt_nginx_config() {
    log_info "Creating nginx configuration for Let's Encrypt..."
    
    cat > nginx/nginx-letsencrypt.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Upstream definitions
    upstream backend_service {
        server backend:5000;
    }

    upstream frontend_service {
        server frontend:80;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name pms.omyratech.com;
        
        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/html;
        }
        
        # Redirect all other traffic to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS Server Configuration with Let's Encrypt
    server {
        listen 443 ssl;
        http2 on;
        server_name pms.omyratech.com;

        # Let's Encrypt SSL Configuration
        ssl_certificate /etc/ssl/certs/letsencrypt/fullchain.pem;
        ssl_certificate_key /etc/ssl/certs/letsencrypt/privkey.pem;
        
        # Modern SSL Configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # Security Headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        
        # Gzip Compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_proxied any;
        gzip_comp_level 6;
        gzip_types
            application/json
            application/javascript
            application/xml+rss
            application/atom+xml
            image/svg+xml
            text/plain
            text/css
            text/js
            text/xml
            text/javascript;
        
        # API Proxy to backend
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend_service/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
            proxy_set_header X-Forwarded-Port 443;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Health check endpoint
        location /health {
            proxy_pass http://backend_service/health;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }
        
        # Frontend routing
        location / {
            proxy_pass http://frontend_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }
    }
}
EOF

    log_success "Let's Encrypt nginx configuration created"
}

# Update docker-compose for Let's Encrypt
update_docker_compose_letsencrypt() {
    log_info "Updating docker-compose for Let's Encrypt..."
    
    # Update nginx configuration path and add letsencrypt volume
    sed -i 's|nginx/nginx-http-temp.conf|nginx/nginx-letsencrypt.conf|g' docker-compose.production.yml
    
    # Add letsencrypt certificates volume
    if ! grep -q "letsencrypt" docker-compose.production.yml; then
        sed -i '/ssl\/certs:/a\      - ./ssl/certs/letsencrypt:/etc/ssl/certs/letsencrypt:ro' docker-compose.production.yml
    fi
    
    log_success "Docker-compose configuration updated"
}

# Setup certificate renewal
setup_certificate_renewal() {
    log_info "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > renew-letsencrypt.sh << 'EOF'
#!/bin/bash
# Renew Let's Encrypt certificates

cd /home/azureuser/Omyra-Project_Management

# Stop nginx
docker compose -f docker-compose.production.yml stop nginx

# Renew certificates
sudo certbot renew --standalone

# Copy renewed certificates
if [ -f "/etc/letsencrypt/live/pms.omyratech.com/fullchain.pem" ]; then
    sudo cp /etc/letsencrypt/live/pms.omyratech.com/fullchain.pem ssl/certs/letsencrypt/
    sudo cp /etc/letsencrypt/live/pms.omyratech.com/privkey.pem ssl/certs/letsencrypt/
    sudo chown -R azureuser:azureuser ssl/certs/letsencrypt/
fi

# Start nginx
docker compose -f docker-compose.production.yml start nginx

echo "Certificate renewal completed at $(date)"
EOF

    chmod +x renew-letsencrypt.sh
    
    # Add to crontab (check twice daily)
    (crontab -l 2>/dev/null; echo "0 */12 * * * /home/azureuser/Omyra-Project_Management/renew-letsencrypt.sh >> /var/log/letsencrypt-renewal.log 2>&1") | crontab -
    
    log_success "Certificate renewal automation set up"
}

# Fallback to self-signed with better browser compatibility
setup_self_signed_fallback() {
    log_warning "Setting up enhanced self-signed certificates as fallback..."
    
    # Create a configuration that browsers might accept better
    cat > ssl_config_browser_friendly.conf << 'EOF'
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=US
ST=State
L=City
O=Omyra Technologies
CN=pms.omyratech.com

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = pms.omyratech.com
DNS.2 = *.omyratech.com
DNS.3 = localhost
IP.1 = 4.240.101.137
IP.2 = 127.0.0.1
EOF

    # Generate new self-signed certificates
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/certs/server.key \
        -out ssl/certs/server.crt \
        -config ssl_config_browser_friendly.conf \
        -extensions v3_req
    
    # Update nginx to use original ssl configuration but with HTTP also available
    sed -i 's|nginx/nginx-letsencrypt.conf|nginx/nginx-ssl.conf|g' docker-compose.production.yml
    
    log_success "Enhanced self-signed certificates generated"
}

# Main function
main() {
    echo "🔐 Let's Encrypt SSL Setup for Omyra PMS"
    echo "========================================"
    
    case "${1:-auto}" in
        "letsencrypt")
            if check_domain_accessibility; then
                setup_letsencrypt
                create_letsencrypt_nginx_config
                update_docker_compose_letsencrypt
                setup_certificate_renewal
                
                # Restart with new configuration
                docker compose -f docker-compose.production.yml up -d
                
                log_success "Let's Encrypt setup completed!"
                log_info "Your site is now available at: https://pms.omyratech.com"
            else
                log_error "Domain accessibility check failed. Cannot proceed with Let's Encrypt."
                exit 1
            fi
            ;;
        "self-signed")
            setup_self_signed_fallback
            docker compose -f docker-compose.production.yml restart nginx
            log_success "Enhanced self-signed certificates setup completed!"
            ;;
        "auto")
            if check_domain_accessibility; then
                log_info "Domain is accessible. Attempting Let's Encrypt setup..."
                if setup_letsencrypt; then
                    create_letsencrypt_nginx_config
                    update_docker_compose_letsencrypt
                    setup_certificate_renewal
                    docker compose -f docker-compose.production.yml up -d
                    log_success "Let's Encrypt setup completed!"
                else
                    log_warning "Let's Encrypt failed. Falling back to enhanced self-signed certificates..."
                    setup_self_signed_fallback
                    docker compose -f docker-compose.production.yml restart nginx
                fi
            else
                log_info "Domain accessibility issues detected. Using enhanced self-signed certificates..."
                setup_self_signed_fallback
                docker compose -f docker-compose.production.yml restart nginx
            fi
            ;;
        *)
            echo "Usage: $0 {auto|letsencrypt|self-signed}"
            echo ""
            echo "Commands:"
            echo "  auto        - Try Let's Encrypt, fallback to self-signed (default)"
            echo "  letsencrypt - Force Let's Encrypt setup"
            echo "  self-signed - Use enhanced self-signed certificates"
            exit 1
            ;;
    esac
    
    echo ""
    log_info "Testing HTTPS access..."
    sleep 5
    if curl -f -k -s https://pms.omyratech.com/health > /dev/null; then
        log_success "HTTPS is working! Site is accessible at:"
        echo "  🌐 HTTP:  http://pms.omyratech.com"
        echo "  🔐 HTTPS: https://pms.omyratech.com"
    else
        log_warning "HTTPS setup completed but site may need a few moments to be fully accessible."
    fi
}

# Run main function
main "$@"
