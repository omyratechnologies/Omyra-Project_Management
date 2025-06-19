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
docker compose -f docker-compose.production.yml exec nginx nginx -s reload

echo "Certificates renewed successfully!"
