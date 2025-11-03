// lib/firebaseAdmin.js
const admin = require('firebase-admin');

let app;
if (!admin.apps.length) {
  // Prefer environment variables so this works in Vercel/containers
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Important: replace escaped newlines in env var for private key
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ Firebase Admin is not fully configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.');
  }

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
} else {
  app = admin.app();
}

const db = admin.firestore();
// Avoid errors when some fields are undefined
db.settings({ ignoreUndefinedProperties: true });

module.exports = { admin, db };