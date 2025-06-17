# Email Server Documentation

## Overview

The Omyra Project Management application includes a comprehensive email server implementation that allows you to:

1. **Send emails** using various SMTP providers (Gmail, SendGrid, Mailgun, AWS SES, custom SMTP)
2. **Receive emails** through a built-in SMTP server
3. **Use email templates** for common notifications (welcome, password reset, task assignments)
4. **Queue emails** for reliable delivery
5. **Monitor email status** and track delivery

## Features

### 📧 Email Sending
- Support for multiple SMTP providers
- Custom email templates with variable substitution
- Email queuing system for reliable delivery
- Rich HTML email support
- Attachment support
- CC/BCC support

### 📬 Email Receiving (Built-in SMTP Server)
- Receive emails on a custom port (default: 2525)
- Parse incoming emails automatically
- Event-driven email processing
- Optional authentication for incoming emails

### 📝 Pre-built Templates
- **Welcome Email**: For new user registrations
- **Password Reset**: For password recovery
- **Task Assignment**: For task notifications
- **Custom Templates**: Add your own templates

## API Endpoints

### Email Service Status
```
GET /api/email/status
```
Returns the current status of the email service, queue length, and available templates.

### Send Custom Email
```
POST /api/email/send
Authorization: Bearer <token>

Body:
{
  "to": "user@example.com",
  "subject": "Your Subject",
  "text": "Plain text content",
  "html": "<h1>HTML content</h1>",
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"]
}
```

### Send Template Email
```
POST /api/email/send-template
Authorization: Bearer <token>

Body:
{
  "templateName": "welcome",
  "to": "user@example.com",
  "variables": {
    "appName": "Omyra",
    "userName": "John Doe"
  }
}
```

### Queue Email
```
POST /api/email/queue
Authorization: Bearer <token>

Body:
{
  "to": "user@example.com",
  "subject": "Your Subject",
  "html": "<h1>HTML content</h1>"
}
```

### Send Welcome Email
```
POST /api/email/send-welcome
Authorization: Bearer <token>

Body:
{
  "email": "user@example.com",
  "userName": "John Doe"
}
```

### Send Password Reset Email
```
POST /api/email/send-password-reset
Authorization: Bearer <token>

Body:
{
  "email": "user@example.com",
  "userName": "John Doe",
  "resetLink": "https://your-app.com/reset-password?token=abc123"
}
```

### Send Task Assignment Email
```
POST /api/email/send-task-assignment
Authorization: Bearer <token>

Body:
{
  "email": "user@example.com",
  "assigneeName": "John Doe",
  "projectName": "My Project",
  "taskTitle": "Complete Feature X",
  "taskDescription": "Implement the new feature",
  "dueDate": "2025-07-01",
  "priority": "high",
  "taskLink": "https://your-app.com/tasks/123"
}
```

### Add Custom Template
```
POST /api/email/templates
Authorization: Bearer <token>

Body:
{
  "name": "custom-notification",
  "subject": "{{title}} - {{appName}}",
  "html": "<h1>{{title}}</h1><p>{{message}}</p>",
  "variables": ["title", "message", "appName"]
}
```

## Configuration

### Environment Variables

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com           # SMTP server host
EMAIL_PORT=587                      # SMTP server port
EMAIL_SECURE=false                  # Use TLS (true for port 465)
EMAIL_USER=your-email@gmail.com     # SMTP username
EMAIL_PASSWORD=your-app-password    # SMTP password
EMAIL_FROM=noreply@omyra-project.com # Default sender address

# Built-in SMTP Server
SMTP_USER=admin                     # Auth username for incoming emails
SMTP_PASSWORD=password123           # Auth password for incoming emails
SMTP_PORT=2525                      # Port for incoming SMTP server
```

### Supported Email Providers

#### Gmail
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password    # Use App Password, not regular password
```

#### SendGrid
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

#### Mailgun
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-mailgun-username
EMAIL_PASSWORD=your-mailgun-password
```

#### AWS SES
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ses-access-key
EMAIL_PASSWORD=your-ses-secret-key
```

## Usage Examples

### Integration with User Registration

```typescript
// In your auth controller
import { emailService } from '../services/emailService.js';

// After successful user registration
await emailService.sendTemplateEmail('welcome', user.email, {
  appName: 'Omyra Project Management',
  userName: user.name
});
```

### Integration with Task Assignment

```typescript
// In your task controller
import { emailService } from '../services/emailService.js';

// When assigning a task
await emailService.sendTemplateEmail('task-assigned', assigneeEmail, {
  appName: 'Omyra Project Management',
  assigneeName: assignee.name,
  projectName: project.name,
  taskTitle: task.title,
  taskDescription: task.description,
  dueDate: task.dueDate.toDateString(),
  priority: task.priority,
  priorityColor: getPriorityColor(task.priority),
  taskLink: `${frontendUrl}/tasks/${task.id}`
});
```

### Custom Email Template

```typescript
// Add a custom template
emailService.addTemplate({
  name: 'project-completed',
  subject: 'Project {{projectName}} Completed! 🎉',
  html: `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #28a745;">🎉 Project Completed!</h1>
      <p>Hi {{userName}},</p>
      <p>Great news! The project <strong>{{projectName}}</strong> has been completed.</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Project Summary:</h3>
        <p><strong>Total Tasks:</strong> {{totalTasks}}</p>
        <p><strong>Completion Date:</strong> {{completionDate}}</p>
        <p><strong>Team Members:</strong> {{teamMembers}}</p>
      </div>
      <p>Thank you for your hard work!</p>
    </div>
  `,
  variables: ['userName', 'projectName', 'totalTasks', 'completionDate', 'teamMembers']
});

// Use the custom template
await emailService.sendTemplateEmail('project-completed', teamEmails, {
  userName: 'Team',
  projectName: 'Website Redesign',
  totalTasks: '25',
  completionDate: new Date().toDateString(),
  teamMembers: 'John, Jane, Bob'
});
```

## Event Monitoring

The email service emits events that you can listen to:

```typescript
import { emailService } from '../services/emailService.js';

// Listen for successful email sends
emailService.on('emailSent', ({ message, result }) => {
  console.log(`✅ Email sent to ${message.to}: ${message.subject}`);
  // Log to database, update metrics, etc.
});

// Listen for failed email sends
emailService.on('emailFailed', ({ message, error }) => {
  console.error(`❌ Failed to send email to ${message.to}:`, error);
  // Log error, retry logic, alert admins, etc.
});

// Listen for received emails (if SMTP server is enabled)
emailService.on('emailReceived', (email) => {
  console.log(`📧 Received email from ${email.from}: ${email.subject}`);
  // Process incoming emails, create support tickets, etc.
});
```

## Testing

### Test Email Configuration
```bash
# Test the email service status
curl -X GET http://localhost:5000/api/email/status

# Send a test email (requires authentication)
curl -X POST http://localhost:5000/api/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>This is a test email</h1>"
  }'
```

### Development Mode
In development mode, the email service will:
1. Start a built-in SMTP server on port 2525
2. Log all email attempts to the console
3. Use fallback transport if external SMTP fails

## Security Considerations

1. **Use App Passwords**: For Gmail, use App Passwords instead of your regular password
2. **Environment Variables**: Store all credentials in environment variables, never in code
3. **Rate Limiting**: The API includes rate limiting to prevent spam
4. **Authentication**: All email endpoints (except status) require JWT authentication
5. **Input Validation**: All inputs are validated to prevent injection attacks

## Troubleshooting

### Common Issues

#### 1. Gmail Authentication Error
- Enable 2-Factor Authentication on your Google account
- Generate an App Password specifically for this application
- Use the App Password in the `EMAIL_PASSWORD` environment variable

#### 2. SMTP Connection Timeout
- Check firewall settings
- Verify SMTP server host and port
- Ensure your hosting provider allows SMTP connections

#### 3. Emails Going to Spam
- Set up SPF, DKIM, and DMARC records for your domain
- Use a reputable email service provider
- Include unsubscribe links in marketing emails

#### 4. Template Variables Not Working
- Ensure variable names match exactly (case-sensitive)
- Check that all required variables are provided
- Use `{{variableName}}` syntax in templates

### Logs and Monitoring

The email service provides comprehensive logging:
- ✅ Successful email sends
- ❌ Failed email attempts
- 📧 Received emails (if SMTP server enabled)
- 📊 Queue status and length

Monitor these logs to ensure reliable email delivery and troubleshoot issues.

## Advanced Configuration

### Custom Templates with Complex Logic

```typescript
// Template with conditional content
const advancedTemplate = {
  name: 'advanced-notification',
  subject: '{{#if urgent}}URGENT: {{/if}}{{title}}',
  html: `
    <div style="max-width: 600px; margin: 0 auto;">
      {{#if urgent}}
        <div style="background: #dc3545; color: white; padding: 10px; text-align: center;">
          <strong>URGENT NOTIFICATION</strong>
        </div>
      {{/if}}
      <h1>{{title}}</h1>
      <p>{{message}}</p>
      {{#if showButton}}
        <a href="{{buttonLink}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">
          {{buttonText}}
        </a>
      {{/if}}
    </div>
  `,
  variables: ['title', 'message', 'urgent', 'showButton', 'buttonLink', 'buttonText']
};
```

### Email Analytics Integration

```typescript
// Track email opens (add to templates)
const trackingPixel = `<img src="{{trackingUrl}}/open/{{emailId}}" width="1" height="1" style="display:none;" />`;

// Track link clicks (wrap links)
const trackedLink = `<a href="{{trackingUrl}}/click/{{emailId}}/{{linkId}}?redirect={{originalUrl}}">{{linkText}}</a>`;
```

This email server implementation provides a robust, scalable solution for all your application's email needs while maintaining security and reliability.
