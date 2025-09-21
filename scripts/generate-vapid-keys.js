/**
 * VAPID Key Generation Script
 * MELLOWISE-015: Generate VAPID keys for push notification setup
 */

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

console.log('🔑 Generating VAPID keys for Mellowise push notifications...\n');

try {
  // Generate VAPID keys
  const vapidKeys = webpush.generateVAPIDKeys();

  console.log('✅ VAPID keys generated successfully!\n');
  console.log('📋 Add these to your .env.local file:\n');
  console.log(`VAPID_EMAIL=mailto:notifications@yourdomain.com`);
  console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);

  // Optionally write to a file
  const envContent = `
# VAPID Keys for Push Notifications (Generated: ${new Date().toISOString()})
VAPID_EMAIL=mailto:notifications@yourdomain.com
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
`;

  const envPath = path.join(__dirname, '..', '.env.vapid');
  fs.writeFileSync(envPath, envContent.trim());

  console.log(`\n💾 Keys also saved to: ${envPath}`);
  console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
  console.log('   • Keep the private key secret and secure');
  console.log('   • Add .env.vapid to your .gitignore file');
  console.log('   • Use different keys for development and production');
  console.log('   • Update your email address in VAPID_EMAIL');

} catch (error) {
  console.error('❌ Error generating VAPID keys:', error);
  process.exit(1);
}