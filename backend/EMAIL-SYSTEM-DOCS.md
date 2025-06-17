# Email System Documentation

## Overview

The Omyra Project Nexus application includes a comprehensive email system that handles various types of notifications and communications. The system is built using Node.js with Nodemailer and includes HTML email templates, email queueing, and automatic notifications.

## Architecture

### Email Service (`emailService.ts`)
- **Location**: `backend/src/services/emailService.ts`
- **Purpose**: Main email service that handles template loading, email sending, queuing, and SMTP server functionality
- **Features**:
  - HTML template loading from files
  - Variable replacement in templates
  - Email queuing with processing
  - SMTP server for receiving emails
  - Event-driven architecture
  - Statistics tracking
  - Automatic task deadline reminders

### Email Templates
- **Location**: `backend/src/templates/email/`
- **Format**: HTML files with template variables (e.g., `{{userName}}`)
- **Available Templates**:
  - `welcome.html` - Welcome email for new users
  - `password-reset.html` - Password reset instructions
  - `task-assigned.html` - Task assignment notifications
  - `project-invitation.html` - Project membership invitations
  - `task-deadline-reminder.html` - Task deadline reminders
  - `project-status-update.html` - Project status notifications

### Email Controller (`emailController.ts`)
- **Location**: `backend/src/controllers/emailController.ts`
- **Purpose**: HTTP endpoints for email functionality
- **Endpoints**:
  - Test email sending
  - Template management
  - Email statistics
  - Connection testing

## Configuration

### Environment Variables
```bash
# Email Service Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@omyra-project.com

# SMTP Server Configuration
SMTP_USER=admin
SMTP_PASSWORD=password123
SMTP_PORT=2525
```

### Email Provider Setup

#### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password
3. Use the app password in `EMAIL_PASSWORD`

#### Other Providers
The service supports any SMTP provider. Update the configuration accordingly:
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **AWS SES**: `email-smtp.us-east-1.amazonaws.com:587`

## Email Templates

### Template Structure
Each template is an HTML file with:
- Responsive design (max-width: 600px)
- Inline CSS for email client compatibility
- Template variables in `{{variable}}` format
- Consistent branding and styling

### Template Variables
Common variables across templates:
- `{{appName}}` - Application name
- `{{userName}}` - User's display name
- `{{userEmail}}` - User's email address

Template-specific variables are documented in each template file.

### Customizing Templates
1. Edit HTML files in `backend/src/templates/email/`
2. Use `{{variableName}}` for dynamic content
3. Test templates using the email service API
4. Restart the server to reload templates

## API Endpoints

### Authentication Required
Most email endpoints require authentication via JWT token.

### Available Endpoints

#### Test Email
```http
POST /api/email/test
Content-Type: application/json
Authorization: Bearer <token>

{
  "to": "user@example.com",
  "subject": "Test Email",
  "message": "Test message content",
  "template": "welcome",
  "variables": {
    "userName": "John Doe",
    "appName": "Omyra Project Nexus"
  }
}
```

#### Get Email Templates
```http
GET /api/email/templates
Authorization: Bearer <token>
```

#### Get Email Statistics
```http
GET /api/email/stats
Authorization: Bearer <token>
```

#### Test Email Connection
```http
GET /api/email/test-connection
Authorization: Bearer <token>
```

## Integration Points

### User Registration
- **Trigger**: When a new user registers
- **Email**: Welcome email with getting started information
- **Template**: `welcome.html`

### Password Reset
- **Trigger**: When user requests password reset
- **Email**: Password reset link with expiration
- **Template**: `password-reset.html`

### Task Assignment
- **Trigger**: When a task is assigned to a user
- **Email**: Task details with direct link
- **Template**: `task-assigned.html`

### Project Invitation
- **Trigger**: When a user is added to a project
- **Email**: Project invitation with role information
- **Template**: `project-invitation.html`

### Task Deadline Reminders
- **Trigger**: Automatic scheduler (runs hourly)
- **Email**: Reminder for tasks due within 24 hours
- **Template**: `task-deadline-reminder.html`

## Email Queue System

### Features
- **Automatic Processing**: Emails are queued and processed sequentially
- **Rate Limiting**: 1-second delay between emails to prevent spam detection
- **Error Handling**: Failed emails are logged and tracked
- **Statistics**: Track sent, failed, queued, and delivered emails

### Queue Management
```typescript
// Add email to queue
await emailService.queueEmail(emailMessage);

// Get queue length
const queueLength = emailService.getQueueLength();

// Get statistics
const stats = emailService.getStats();
```

## SMTP Server

### Development Mode
In development, the system starts a local SMTP server for testing:
- **Port**: 2525 (configurable)
- **Authentication**: Basic auth with configured credentials
- **Purpose**: Receive and log incoming emails for testing

### Production Mode
In production, the SMTP server is disabled. Only outgoing emails are sent.

## Monitoring and Logging

### Event Logging
The email service emits events for monitoring:
- `emailSent` - Successful email delivery
- `emailFailed` - Failed email delivery
- `emailReceived` - Incoming email (SMTP server)

### Statistics
Track email metrics:
```typescript
{
  sent: 150,      // Successfully sent emails
  failed: 5,      // Failed email attempts
  queued: 2,      // Emails waiting in queue
  delivered: 145  // Confirmed deliveries
}
```

### Error Handling
- All email operations include try-catch blocks
- Failed emails don't crash the application
- Errors are logged with context for debugging

## Security Considerations

### Email Content
- Never include sensitive data in email content
- Use secure tokens for password resets (1-hour expiration)
- Validate all email addresses before sending

### SMTP Security
- Use app-specific passwords, not account passwords
- Enable TLS/SSL for SMTP connections
- Rotate credentials regularly

### Rate Limiting
- Built-in rate limiting prevents abuse
- Queue system manages email volume
- Consider external email service limits

## Testing

### Local Testing
1. Start the server in development mode
2. Use the SMTP server on port 2525
3. Send test emails via API endpoints
4. Check console logs for email events

### Email Client Testing
1. Use tools like MailHog or Mailcatcher
2. Configure EMAIL_HOST to point to test server
3. View emails in web interface

### Template Testing
1. Send test emails with sample data
2. Check rendering in multiple email clients
3. Verify mobile responsiveness

## Troubleshooting

### Common Issues

#### Email Not Sending
1. Check SMTP credentials
2. Verify network connectivity
3. Check email provider limits
4. Review server logs for errors

#### Templates Not Loading
1. Verify file paths are correct
2. Check file permissions
3. Restart server to reload templates
4. Check for syntax errors in HTML

#### High Queue Length
1. Check email service connection
2. Review rate limiting settings
3. Monitor email provider limits
4. Consider scaling email service

### Debug Mode
Enable detailed logging by setting log level to debug:
```bash
NODE_ENV=development
```

## Maintenance

### Regular Tasks
1. Monitor email statistics
2. Review failed email logs
3. Update email templates as needed
4. Rotate SMTP credentials
5. Clear old email logs

### Performance Optimization
1. Monitor queue processing time
2. Optimize template loading
3. Consider external email service for high volume
4. Implement email template caching

## Future Enhancements

### Planned Features
- Email template editor UI
- Advanced email analytics
- A/B testing for email templates
- Webhook support for delivery confirmations
- Email unsubscribe management
- Multi-language template support

### Scalability Considerations
- External email service integration (SendGrid, AWS SES)
- Email service clustering
- Template caching and optimization
- Database-backed email queue
- Advanced monitoring and alerting
