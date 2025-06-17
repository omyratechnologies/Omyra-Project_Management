import nodemailer from 'nodemailer';

async function testSMTPServer() {
  console.log('📧 Testing SMTP Server...');
  
  try {
    // Create a transporter that connects to our SMTP server
    const transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 2525,
      secure: false,
      auth: {
        user: 'admin',
        pass: 'password123'
      }
    });
    
    // Send a test email to our server
    const result = await transporter.sendMail({
      from: 'sender@example.com',
      to: 'receiver@omyra-project.com',
      subject: 'Test Email to SMTP Server',
      text: 'This is a test email sent to our custom SMTP server.',
      html: '<h1>Test Email</h1><p>This is a test email sent to our custom SMTP server.</p>'
    });
    
    console.log('✅ Email sent to SMTP server:', result.messageId);
    
  } catch (error) {
    console.error('❌ Failed to send email to SMTP server:', error);
  }
}

// Run the test
testSMTPServer();
