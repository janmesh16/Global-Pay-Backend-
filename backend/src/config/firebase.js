const admin = require('firebase-admin');
const env = require('./env');
const logger = require('../utils/logger');

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK.
 * Gracefully skips when Firebase is not configured (dev mode without Firebase).
 */
const initFirebase = () => {
  if (!env.isFirebaseConfigured()) {
    logger.warn('[firebase] Firebase not configured. FCM and Firebase Auth will be disabled.');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY,
      }),
    });
    logger.info('[firebase] Firebase Admin initialized');
    return firebaseApp;
  } catch (error) {
    logger.error(`[firebase] Failed to initialize: ${error.message}`);
    return null;
  }
};

const getFirebaseApp = () => firebaseApp;
const isFirebaseReady = () => !!firebaseApp;

module.exports = { initFirebase, getFirebaseApp, isFirebaseReady };
