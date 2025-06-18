# Omyra Email Server Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   Copy `.env.example` to `.env` and configure your email settings:
   ```bash
   cp .env.example .env
   ```

3. **Build and Start the Server**
   ```bash
   npm run build
   npm run dev
   ```

## Email Configuration Options

### Option 1: Gmail (Recommended for Development)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate a password for "Mail"
3. Configure your `.env`:
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   EMAIL_FROM=noreply@your-domain.com
   ```

### Option 2: SendGrid (Recommended for Production)

1. Sign up for SendGrid and get your API key
2. Configure your `.env`:
   ```bash
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   EMAIL_FROM=noreply@your-domain.com
   ```

### Option 3: Custom SMTP Server

```bash
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@your-domain.com
```

## Testing the Email Server

### 1. Test Email Service
```bash
npm run test:email
```

### 2. Test SMTP Server (if enabled)
```bash
npm run test:smtp
```

### 3. API Testing with cURL

**Check Status:**
```bash
curl -X GET http://localhost:5000/api/email/status
```

**Send Test Email (requires authentication):**
```bash
curl -X POST http://localhost:5000/api/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello from Omyra!</h1>"
  }'
```

## Email Templates

### Available Templates
- `welcome` - Welcome email for new users
- `password-reset` - Password reset email
- `task-assigned` - Task assignment notification

### Adding Custom Templates

Use the API endpoint:
```bash
curl -X POST http://localhost:5000/api/email/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "custom-notification",
    "subject": "{{title}} - {{appName}}",
    "html": "<h1>{{title}}</h1><p>{{message}}</p>",
    "variables": ["title", "message", "appName"]
  }'
```

## Integration Examples

### Send Welcome Email After User Registration

```typescript
// In your auth controller
import { emailService } from '../services/emailService.js';

// After successful user registration
try {
  await emailService.sendTemplateEmail('welcome', user.email, {
    appName: 'Omyra Project Management',
    userName: user.name || user.email
  });
  console.log('Welcome email sent successfully');
} catch (error) {
  console.error('Failed to send welcome email:', error);
}
```

### Send Task Assignment Notification

```typescript
// In your task controller
import { emailService } from '../services/emailService.js';

// When assigning a task to a user
try {
  await emailService.sendTemplateEmail('task-assigned', assignee.email, {
    appName: 'Omyra Project Management',
    assigneeName: assignee.name,
    projectName: project.name,
    taskTitle: task.title,
    taskDescription: task.description,
    dueDate: task.dueDate.toLocaleDateString(),
    priority: task.priority,
    priorityColor: getPriorityColor(task.priority),
    taskLink: `${process.env.FRONTEND_URL}/tasks/${task.id}`
  });
} catch (error) {
  console.error('Failed to send task assignment email:', error);
}
```

### Send Password Reset Email

```typescript
// In your auth controller
import { emailService } from '../services/emailService.js';
import jwt from 'jsonwebtoken';

// Generate reset token
const resetToken = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

try {
  await emailService.sendTemplateEmail('password-reset', user.email, {
    appName: 'Omyra Project Management',
    userName: user.name || user.email,
    resetLink: resetLink
  });
} catch (error) {
  console.error('Failed to send password reset email:', error);
}
```

## SMTP Server (Receiving Emails)

The email server includes a built-in SMTP server for receiving emails (development only).

### Configuration
```bash
SMTP_USER=admin
SMTP_PASSWORD=password123
SMTP_PORT=2525
```

### Listening for Incoming Emails
```typescript
import { emailService } from '../services/emailService.js';

emailService.on('emailReceived', (email) => {
  console.log('Received email:', {
    from: email.from,
    to: email.to,
    subject: email.subject,
    date: email.date
  });
  
  // Process the email (create support ticket, auto-reply, etc.)
  // Example: Create a support ticket from the email
  if (email.to.includes('support@')) {
    createSupportTicket({
      from: email.from,
      subject: email.subject,
      message: email.text || email.html,
      attachments: email.attachments
    });
  }
});
```

## Monitoring and Logging

The email service provides comprehensive event logging:

```typescript
import { emailService } from '../services/emailService.js';

// Monitor successful sends
emailService.on('emailSent', ({ message, result }) => {
  console.log(`✅ Email sent to ${message.to}: ${message.subject}`);
  // Log to database for analytics
});

// Monitor failures
emailService.on('emailFailed', ({ message, error }) => {
  console.error(`❌ Failed to send email to ${message.to}:`, error);
  // Alert administrators, retry logic, etc.
});

// Monitor queue status
setInterval(() => {
  const queueLength = emailService.getQueueLength();
  if (queueLength > 10) {
    console.warn(`⚠️ Email queue is getting large: ${queueLength} emails pending`);
  }
}, 60000); // Check every minute
```

## Production Deployment

### Security Checklist
- [ ] Use environment variables for all credentials
- [ ] Enable HTTPS/TLS for SMTP connections
- [ ] Set up SPF, DKIM, and DMARC records
- [ ] Use a dedicated email service (SendGrid, Mailgun, AWS SES)
- [ ] Implement rate limiting and monitoring
- [ ] Set up email bounce and complaint handling

### Recommended Production Setup
1. **Use SendGrid or AWS SES** for reliable delivery
2. **Set up proper DNS records** (SPF, DKIM, DMARC)
3. **Monitor email metrics** (delivery rates, bounces, complaints)
4. **Implement retry logic** for failed sends
5. **Set up alerts** for high failure rates

### Environment Variables for Production
```bash
# Use a professional email service
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-production-api-key
EMAIL_FROM=noreply@yourdomain.com

# Disable SMTP server in production
NODE_ENV=production
```

## Troubleshooting

### Common Issues

1. **"Invalid login" error with Gmail**
   - Make sure 2FA is enabled
   - Use App Password, not regular password
   - Check if "Less secure app access" is disabled (should be)

2. **Emails not being received**
   - Check spam folders
   - Verify DNS records (SPF, DKIM, DMARC)
   - Check email service provider limits

3. **SMTP connection timeout**
   - Check firewall settings
   - Verify host and port settings
   - Ensure your hosting provider allows SMTP

4. **High bounce rate**
   - Verify email addresses before sending
   - Check sender reputation
   - Avoid spam trigger words

### Debug Mode
Set `NODE_ENV=development` to enable debug logging and fallback email transport.

## API Reference

For complete API documentation, see [EMAIL-SERVER-DOCS.md](./EMAIL-SERVER-DOCS.md).

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your environment configuration
3. Test with a simple email service like Gmail first
4. Check our troubleshooting guide above

Happy emailing! 📧
