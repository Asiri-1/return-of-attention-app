// admin-setup/setup-admin.js - Enhanced Zero-Cost Secure Version
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin SDK (using your existing config)
const serviceAccount = JSON.parse(
  readFileSync('../serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'return-of-attention-app'
});

// Zero-cost role definitions (no external services needed)
const ADMIN_ROLES = {
  SUPER_ADMIN: {
    level: 100,
    permissions: ['*'], // All permissions
    description: 'Full system access'
  },
  ADMIN: {
    level: 50,
    permissions: [
      'users.read', 'users.write', 
      'analytics.read', 'content.write'
    ],
    description: 'Standard admin access'
  },
  MODERATOR: {
    level: 25,
    permissions: ['users.read', 'content.moderate'],
    description: 'Content moderation'
  }
};

// Enhanced setup function with zero-cost logging
async function setupAdminUser(email, role = 'SUPER_ADMIN') {
  try {
    console.log(`🔧 Setting up admin: ${email} with role: ${role}`);
    
    // Validate role exists
    if (!ADMIN_ROLES[role]) {
      throw new Error(`❌ Invalid role: ${role}. Available: ${Object.keys(ADMIN_ROLES).join(', ')}`);
    }

    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${user.uid}`);
    
    // Set custom claims (FREE on Firebase)
    const customClaims = {
      admin: true,
      role: role,
      permissions: ADMIN_ROLES[role].permissions,
      level: ADMIN_ROLES[role].level,
      setupDate: new Date().toISOString(),
      setupBy: 'zero-cost-script'
    };
    
    await admin.auth().setCustomUserClaims(user.uid, customClaims);
    console.log(`✅ Custom claims set for ${email}`);
    
    // Verify claims were set (zero-cost verification)
    const userRecord = await admin.auth().getUser(user.uid);
    console.log(`✅ Verification - Claims:`, userRecord.customClaims);
    
    // Optional: Create admin status document in Firestore (FREE tier)
    try {
      await admin.firestore().collection('admin_users').doc(user.uid).set({
        email: email,
        role: role,
        level: ADMIN_ROLES[role].level,
        setupDate: admin.firestore.FieldValue.serverTimestamp(),
        lastActive: null
      });
      console.log(`✅ Admin status document created`);
    } catch (firestoreError) {
      console.log(`⚠️ Firestore write failed (continuing anyway):`, firestoreError.message);
    }
    
    console.log(`🎉 SUCCESS: ${email} is now ${role} (Level ${ADMIN_ROLES[role].level})`);
    
  } catch (error) {
    console.error(`❌ ERROR setting up admin for ${email}:`, error.message);
    process.exit(1);
  }
}

// Zero-cost bulk setup function
async function setupMultipleAdmins(adminList) {
  console.log(`🚀 Setting up ${adminList.length} admin users...`);
  
  for (let i = 0; i < adminList.length; i++) {
    const { email, role } = adminList[i];
    console.log(`\n--- Admin ${i + 1}/${adminList.length} ---`);
    await setupAdminUser(email, role);
    
    // Small delay to avoid rate limits (FREE tier consideration)
    if (i < adminList.length - 1) {
      console.log(`⏳ Waiting 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n🎉 ALL DONE! ${adminList.length} admin users configured.`);
}

// USAGE: Replace with your email
const adminUsers = [
  { email: 'asiriamarasinghe35@gmail.com', role: 'SUPER_ADMIN' },
  // Add more admins as needed:
  // { email: 'admin@yourapp.com', role: 'ADMIN' },
  // { email: 'moderator@yourapp.com', role: 'MODERATOR' }
];

// Run the setup
setupMultipleAdmins(adminUsers);

// Alternative: Single admin setup
// setupAdminUser('asiriamarasinghe35@gmail.com', 'SUPER_ADMIN');