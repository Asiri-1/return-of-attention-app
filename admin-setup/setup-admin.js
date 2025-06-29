import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Download service account key from Firebase Console
// Project Settings → Service Accounts → Generate new private key
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'return-of-attention-app'
});

async function setupAdmin(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set admin custom claims
    await admin.auth().setCustomUserClaims(user.uid, { 
      admin: true,
      role: 'admin',
      setupDate: new Date().toISOString()
    });
    
    console.log(`✅ Admin role set for ${email} (UID: ${user.uid})`);
    
    // Verify the claims were set
    const userRecord = await admin.auth().getUser(user.uid);
    console.log('Custom claims:', userRecord.customClaims);
    
  } catch (error) {
    console.error('Error setting admin role:', error.message);
  }
}

// Set up your admin account
setupAdmin('asiriamarasinghe35@gmail.com');

// Add more admins later if needed
// setupAdmin('another-admin@example.com');
