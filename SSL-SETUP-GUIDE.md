# SSL Configuration Guide

This guide covers the SSL implementation for the Omyra Project Nexus application.

## Overview

The application now supports HTTPS with SSL/TLS encryption through Nginx reverse proxy. Two approaches are available:

1. **Self-signed certificates** - For development and testing
2. **Let's Encrypt certificates** - For production use

## Quick Start

### For Development (Self-signed certificates)

```bash
# Generate self-signed SSL certificates
./generate-ssl-certs.sh

# Start the application with SSL
docker-compose -f docker-compose.production.yml up -d

# Access the application
open https://localhost
```

### For Production (Let's Encrypt)

```bash
# Set up Let's Encrypt certificates (requires sudo)
sudo ./setup-letsencrypt.sh yourdomain.com admin@yourdomain.com

# Start the application
docker-compose -f docker-compose.production.yml up -d

# Access the application
open https://yourdomain.com
```

## Files Structure

```
├── ssl/
│   ├── certs/                 # SSL certificates directory
│   │   ├── server.crt         # SSL certificate
│   │   ├── server.key         # Private key
│   │   ├── dhparam.pem        # Diffie-Hellman parameters
│   │   └── chain.pem          # Certificate chain (Let's Encrypt only)
│   ├── letsencrypt/           # Let's Encrypt working directory
│   └── renew-certs.sh         # Certificate renewal script
├── nginx/
│   ├── nginx.conf             # Original HTTP configuration
│   └── nginx-ssl.conf         # SSL-enabled configuration
├── generate-ssl-certs.sh      # Self-signed certificate generator
└── setup-letsencrypt.sh       # Let's Encrypt setup script
```

## SSL Configuration Details

### Nginx SSL Configuration

The SSL configuration includes:

- **TLS 1.2 and 1.3** support
- **Strong cipher suites** with preference for ECDHE
- **HTTP/2** support
- **HSTS** (HTTP Strict Transport Security)
- **OCSP stapling** for certificate validation
- **Security headers** for enhanced protection
- **Automatic HTTP to HTTPS redirect**

### Security Features

1. **Perfect Forward Secrecy** - Uses ECDHE key exchange
2. **Strong Encryption** - AES-256-GCM and ChaCha20-Poly1305
3. **HSTS** - Forces HTTPS for future visits
4. **Secure Headers** - XSS protection, content type sniffing prevention
5. **DH Parameters** - Enhanced security for key exchange

## Certificate Management

### Self-signed Certificates

**Generation:**
```bash
./generate-ssl-certs.sh
```

**Characteristics:**
- Valid for 365 days
- Includes Subject Alternative Names (SAN)
- Supports localhost, 127.0.0.1, and ::1
- Browser will show security warning

**Regeneration:**
```bash
# Remove existing certificates
rm -rf ssl/certs/*

# Generate new certificates
./generate-ssl-certs.sh
```

### Let's Encrypt Certificates

**Initial Setup:**
```bash
sudo ./setup-letsencrypt.sh yourdomain.com admin@yourdomain.com
```

**Automatic Renewal:**
- Configured via systemd timer
- Runs twice daily
- Automatically reloads Nginx

**Manual Renewal:**
```bash
sudo ./ssl/renew-certs.sh yourdomain.com
```

**Renewal Status:**
```bash
# Check timer status
systemctl status ssl-renewal.timer

# Check renewal logs
journalctl -u ssl-renewal.service
```

## Docker Configuration

### SSL-enabled Docker Compose

The `docker-compose.production.yml` has been updated to:

- Expose port 443 for HTTPS
- Mount SSL certificates to Nginx container
- Use SSL-enabled Nginx configuration

### Environment Variables

Update your `.env` file to use HTTPS URLs:

```env
FRONTEND_URL=https://yourdomain.com
# or for development
FRONTEND_URL=https://localhost
```

## Troubleshooting

### Common Issues

1. **Certificate Permission Errors**
   ```bash
   # Fix certificate permissions
   sudo chmod 600 ssl/certs/server.key
   sudo chmod 644 ssl/certs/server.crt
   ```

2. **Port 443 Already in Use**
   ```bash
   # Find process using port 443
   sudo lsof -i :443
   
   # Stop conflicting service
   sudo systemctl stop apache2  # or other web server
   ```

3. **Browser Security Warnings (Self-signed)**
   - Click "Advanced" → "Proceed to localhost (unsafe)"
   - Add certificate to browser's trusted certificates
   - Use Chrome flag: `--ignore-certificate-errors-spki-list`

4. **Let's Encrypt Domain Validation Fails**
   - Ensure DNS points to your server
   - Check firewall allows ports 80 and 443
   - Verify domain is accessible from internet

### Debugging Commands

```bash
# Test SSL certificate
openssl x509 -in ssl/certs/server.crt -text -noout

# Test SSL connection
openssl s_client -connect localhost:443 -servername localhost

# Check Nginx SSL configuration
docker-compose -f docker-compose.production.yml exec nginx nginx -t

# View SSL logs
docker-compose -f docker-compose.production.yml logs nginx
```

### Certificate Verification

```bash
# Check certificate expiration
openssl x509 -in ssl/certs/server.crt -noout -dates

# Verify certificate chain
openssl verify -CAfile ssl/certs/chain.pem ssl/certs/server.crt

# Test HTTPS endpoint
curl -I https://localhost --insecure  # for self-signed
curl -I https://yourdomain.com        # for Let's Encrypt
```

## Security Considerations

### Production Checklist

- [ ] Use Let's Encrypt certificates (not self-signed)
- [ ] Enable HSTS with appropriate max-age
- [ ] Configure proper DNS CAA records
- [ ] Set up certificate monitoring/alerting
- [ ] Implement certificate pinning (if applicable)
- [ ] Regular security audits with tools like SSL Labs

### SSL Labs Test

Test your SSL configuration:
```bash
# Online test (production only)
# Visit: https://www.ssllabs.com/ssltest/
```

### Certificate Monitoring

Monitor certificate expiration:
```bash
# Add to crontab for monitoring
0 8 * * * /path/to/check-ssl-expiry.sh
```

## Performance Optimization

### SSL Session Optimization

The configuration includes:
- SSL session caching (10MB shared cache)
- Session timeout of 10 minutes
- Disabled session tickets for security

### HTTP/2 Benefits

- Multiplexed connections
- Header compression
- Server push capabilities
- Better performance over SSL

## Backup and Recovery

### Certificate Backup

```bash
# Backup certificates
tar -czf ssl-backup-$(date +%Y%m%d).tar.gz ssl/

# Restore certificates
tar -xzf ssl-backup-YYYYMMDD.tar.gz
```

### Disaster Recovery

1. Keep certificate backups secure
2. Document renewal procedures
3. Test restoration process
4. Monitor certificate expiration
5. Have rollback plan to HTTP if needed

## References

- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [NGINX SSL Module](http://nginx.org/en/docs/http/ngx_http_ssl_module.html)
- [SSL Labs Best Practices](https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices)
