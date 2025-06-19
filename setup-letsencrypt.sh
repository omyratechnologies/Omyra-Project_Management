#!/bin/bash

# Let's Encrypt SSL Certificate Setup Script
# This script sets up SSL certificates using Let's Encrypt/Certbot

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="$SCRIPT_DIR/ssl"
CERTS_DIR="$SSL_DIR/certs"
LETSENCRYPT_DIR="$SSL_DIR/letsencrypt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Let's Encrypt SSL Certificate Setup${NC}"
echo "====================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ This script must be run as root (use sudo)${NC}"
    exit 1
fi

# Check if domain is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Usage: $0 <domain_name> [email]${NC}"
    echo "   Example: $0 yourdomain.com admin@yourdomain.com"
    exit 1
fi

DOMAIN="$1"
EMAIL="${2:-admin@$DOMAIN}"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Domain: $DOMAIN"
echo "   Email:  $EMAIL"
echo ""

# Create directories
mkdir -p "$CERTS_DIR"
mkdir -p "$LETSENCRYPT_DIR"

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Installing certbot...${NC}"
    
    # Detect OS and install certbot
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y certbot
    elif command -v yum &> /dev/null; then
        yum install -y certbot
    elif command -v brew &> /dev/null; then
        brew install certbot
    else
        echo -e "${RED}❌ Could not install certbot automatically. Please install it manually.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}🌐 Obtaining SSL certificate from Let's Encrypt...${NC}"

# Stop nginx if it's running (to free up port 80)
if docker-compose -f docker-compose.production.yml ps nginx | grep -q "Up"; then
    echo -e "${YELLOW}⏹️  Stopping nginx temporarily...${NC}"
    docker-compose -f docker-compose.production.yml stop nginx
    RESTART_NGINX=true
fi

# Generate certificate using standalone mode
certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN" \
    --cert-path "$CERTS_DIR/server.crt" \
    --key-path "$CERTS_DIR/server.key" \
    --fullchain-path "$CERTS_DIR/fullchain.pem" \
    --chain-path "$CERTS_DIR/chain.pem"

# Copy certificates to our SSL directory
cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$CERTS_DIR/server.crt"
cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$CERTS_DIR/server.key"
cp "/etc/letsencrypt/live/$DOMAIN/chain.pem" "$CERTS_DIR/chain.pem"

# Generate DH parameters if they don't exist
if [ ! -f "$CERTS_DIR/dhparam.pem" ]; then
    echo -e "${GREEN}🔑 Generating DH parameters...${NC}"
    openssl dhparam -out "$CERTS_DIR/dhparam.pem" 2048
fi

# Set appropriate permissions
chmod 600 "$CERTS_DIR/server.key"
chmod 644 "$CERTS_DIR/server.crt"
chmod 644 "$CERTS_DIR/chain.pem"
chmod 644 "$CERTS_DIR/dhparam.pem"

# Create renewal script
cat > "$SSL_DIR/renew-certs.sh" << 'EOF'
#!/bin/bash
# SSL Certificate Renewal Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="$SCRIPT_DIR/certs"
DOMAIN="$1"

if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 <domain_name>"
    exit 1
fi

# Renew certificate
certbot renew --quiet

# Copy renewed certificates
cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$CERTS_DIR/server.crt"
cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$CERTS_DIR/server.key"
cp "/etc/letsencrypt/live/$DOMAIN/chain.pem" "$CERTS_DIR/chain.pem"

# Reload nginx
docker-compose -f docker-compose.production.yml exec nginx nginx -s reload

echo "Certificates renewed successfully!"
EOF

chmod +x "$SSL_DIR/renew-certs.sh"

# Create systemd timer for automatic renewal (optional)
cat > "/etc/systemd/system/ssl-renewal.service" << EOF
[Unit]
Description=SSL Certificate Renewal
After=network.target

[Service]
Type=oneshot
ExecStart=$SSL_DIR/renew-certs.sh $DOMAIN
User=root
EOF

cat > "/etc/systemd/system/ssl-renewal.timer" << EOF
[Unit]
Description=Run SSL Certificate Renewal twice daily
Requires=ssl-renewal.service

[Timer]
OnCalendar=*-*-* 00,12:00:00
RandomizedDelaySec=3600
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable ssl-renewal.timer
systemctl start ssl-renewal.timer

# Restart nginx if we stopped it
if [ "$RESTART_NGINX" = true ]; then
    echo -e "${GREEN}🔄 Restarting nginx...${NC}"
    docker-compose -f docker-compose.production.yml up -d nginx
fi

echo -e "${GREEN}✅ SSL certificates set up successfully!${NC}"
echo ""
echo "📁 Certificate files:"
echo "   - Certificate: $CERTS_DIR/server.crt"
echo "   - Private Key: $CERTS_DIR/server.key"
echo "   - Chain:       $CERTS_DIR/chain.pem"
echo "   - DH Params:   $CERTS_DIR/dhparam.pem"
echo ""
echo "🔄 Auto-renewal configured:"
echo "   - Service: ssl-renewal.service"
echo "   - Timer:   ssl-renewal.timer (runs twice daily)"
echo "   - Manual:  $SSL_DIR/renew-certs.sh $DOMAIN"
echo ""
echo -e "${GREEN}🌐 Your site is now accessible at: https://$DOMAIN${NC}"
echo ""
echo -e "${YELLOW}📝 Don't forget to update your DNS records to point to this server!${NC}"
