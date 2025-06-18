# Email Configuration Troubleshooting Guide

## Current Status
Your email configuration is **partially working**:
- ✅ SMTP server connection successful (`smtp.omyratech.com`)
- ❌ Authentication failing (Error 535: Incorrect authentication data)

## Issue Analysis
The "535 Incorrect authentication data" error indicates one of these issues:

### 1. **Credential Issues**
- Username/password combination is incorrect
- Password may have been changed or expired

### 2. **Security Settings**
- Two-factor authentication (2FA) is enabled - requires app-specific password
- "Less secure apps" access is disabled
- Corporate security policies preventing SMTP access

### 3. **Account Configuration**
- SMTP access is not enabled for this account
- Account requires different authentication method

## Solutions

### Option 1: Verify Credentials
1. Double-check the username and password
2. Test login via webmail to ensure credentials are correct
3. Check if password has special characters that need escaping

### Option 2: App-Specific Password (Recommended)
If 2FA is enabled on the account:
1. Generate an app-specific password from your email provider
2. Replace the regular password with the app-specific password

### Option 3: Alternative SMTP Settings
Try these alternative configurations:

```env
# Option A: Different port (STARTTLS)
EMAIL_HOST=smtp.omyratech.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Option B: Alternative authentication
EMAIL_HOST=smtp.omyratech.com
EMAIL_PORT=25
EMAIL_SECURE=false
```

### Option 4: Development Mode
For development/testing, enable development mode:

```env
EMAIL_DEV_MODE=true
```

This will log emails to console instead of sending them.

### Option 5: Use Gmail as Fallback
For testing purposes, you can use Gmail:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Security Best Practices

1. **Use App-Specific Passwords**: Never use your main account password for SMTP
2. **Environment Variables**: Keep credentials in .env file (never commit to git)
3. **Rotate Passwords**: Change passwords regularly
4. **Monitor Access**: Check email account for unusual activity

## Next Steps

1. Contact your IT administrator to verify:
   - SMTP access is enabled for your account
   - Correct SMTP server settings
   - Any corporate firewall restrictions

2. Generate app-specific password if 2FA is enabled

3. Test with the improved email service that falls back to development mode

## Testing Commands

```bash
# Test email configuration
cd backend
npx tsx test-email-simple.ts

# Diagnose email issues
npx tsx diagnose-email.ts
```

## Alternative Solutions

If SMTP continues to fail, consider:
1. **Email API Services**: SendGrid, Mailgun, AWS SES
2. **OAuth2 Authentication**: More secure than password-based auth
3. **Internal Mail Server**: Set up your own SMTP server
