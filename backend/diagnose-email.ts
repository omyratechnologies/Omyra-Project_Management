import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function diagnoseEmailIssue() {
  console.log('🔍 Diagnosing Email Configuration...');
  
  console.log('Current configuration:');
  console.log({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    user: process.env.EMAIL_USER,
    from: process.env.EMAIL_FROM
  });
  
  // Test 1: Basic connection without auth
  console.log('\n1. Testing basic connection (no auth)...');
  try {
    const basicTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      // No auth for this test
    });
    
    // This will fail but might give us better error info
    await basicTransporter.verify();
    console.log('✅ Basic connection successful');
  } catch (error) {
    console.log('ℹ️  Basic connection info:', error.message);
  }
  
  // Test 2: Try different port configurations
  console.log('\n2. Testing different port configurations...');
  
  const configs = [
    { port: 587, secure: false, name: 'STARTTLS (587)' },
    { port: 465, secure: true, name: 'SSL/TLS (465)' },
    { port: 25, secure: false, name: 'Plain SMTP (25)' }
  ];
  
  for (const config of configs) {
    try {
      console.log(`   Testing ${config.name}...`);
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: config.port,
        secure: config.secure,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        // Add some debugging options
        debug: false,
        logger: false
      });
      
      await transporter.verify();
      console.log(`   ✅ ${config.name} - Success!`);
      break;
    } catch (error) {
      console.log(`   ❌ ${config.name} - Failed: ${error.message}`);
    }
  }
  
  // Test 3: Check if it's an app password issue
  console.log('\n3. Recommendations:');
  console.log('   📝 If this is a corporate email (omyratech.com):');
  console.log('      - Check if 2FA is enabled and you need an app-specific password');
  console.log('      - Verify the SMTP settings with your IT administrator');
  console.log('      - Ensure "Less secure apps" or "External app access" is enabled');
  console.log('   ');
  console.log('   🔐 Security considerations:');
  console.log('      - Consider using OAuth2 instead of password authentication');
  console.log('      - Store sensitive credentials in a secure vault');
  console.log('      - Use environment-specific configuration files');
}

diagnoseEmailIssue().catch(console.error);
