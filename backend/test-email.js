import { emailService } from '../src/services/emailService.js';

async function testEmailService() {
  console.log('🧪 Testing Email Service...');
  
  try {
    // Test connection
    console.log('1. Testing connection...');
    const isConnected = await emailService.testConnection();
    console.log(`   Connection status: ${isConnected ? '✅ Connected' : '❌ Not connected'}`);
    
    // Test template email
    console.log('2. Testing template email...');
    const templateSuccess = await emailService.sendTemplateEmail(
      'welcome',
      'test@example.com',
      {
        appName: 'Omyra Project Management',
        userName: 'Test User'
      }
    );
    console.log(`   Template email: ${templateSuccess ? '✅ Sent' : '❌ Failed'}`);
    
    // Test custom email
    console.log('3. Testing custom email...');
    const customSuccess = await emailService.sendEmail({
      from: 'test@omyra-project.com',
      to: 'recipient@example.com',
      subject: 'Test Email from Omyra',
      html: '<h1>Hello from Omyra Email Server!</h1><p>This is a test email.</p>'
    });
    console.log(`   Custom email: ${customSuccess ? '✅ Sent' : '❌ Failed'}`);
    
    // Test queue functionality
    console.log('4. Testing email queue...');
    await emailService.queueEmail({
      from: 'queue@omyra-project.com',
      to: 'queued@example.com',
      subject: 'Queued Email Test',
      text: 'This email was sent through the queue system.'
    });
    console.log(`   Email queued. Queue length: ${emailService.getQueueLength()}`);
    
    // Display available templates
    console.log('5. Available templates:');
    const templates = emailService.getTemplates();
    templates.forEach(template => console.log(`   - ${template}`));
    
    console.log('\n✅ Email service test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEmailService();
