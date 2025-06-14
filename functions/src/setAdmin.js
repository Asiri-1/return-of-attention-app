const admin = require("firebase-admin");

// IMPORTANT: The service account key JSON file is now in the parent directory (functions/)
// We use "../" to go up one level from "src/" to "functions/"
const serviceAccount = require("../return-of-attention-app-firebase-adminsdk-fbsvc-34f46cc92c.json");

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const uid = "bP4et6vFOCPjIzhkrtQRUIFOHt12"; // Your User UID

admin.auth().getUser(uid) // Changed from getUserByEmail to getUser
  .then((userRecord) => {
    const userUid = userRecord.uid;
    return admin.auth().setCustomUserClaims(userUid, { admin: true });
  })
  .then(() => {
    console.log(`Custom claim 'admin: true' set for user ${uid}`);
    // Force refresh of ID token on client side (optional, but good practice)
    // This will make the client's ID token reflect the new claim on next refresh
    return admin.auth().revokeRefreshTokens(uid);
  })
  .then(() => {
    console.log(`User ${uid} refresh tokens revoked. User will get new ID token on next login/refresh.`);
    process.exit();
  })
  .catch((error) => {
    console.error("Error setting custom claim:", error);
    process.exit(1);
  });
