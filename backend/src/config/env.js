const dotenv = require('dotenv');
const path = require('path');

// If running in test mode, set JWT_SECRET default if not present
if (process.env.NODE_ENV === 'test') {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';
}

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredVars = ['JWT_SECRET'];
if (process.env.NODE_ENV !== 'test') {
  requiredVars.push('MONGO_URI');
}

const missing = requiredVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`[env] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  get MONGO_URI() {
    return process.env.MONGO_URI || 'mongodb+srv://globalpay:Password123!@cluster0.vyvtb7b.mongodb.net/globalpay?retryWrites=true&w=majority';
  },

  JWT_SECRET: process.env.JWT_SECRET || 'globalpay_super_secret_jwt_key_prod_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // Firebase
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : '',

  // Forex
  FOREX_API_URL: process.env.FOREX_API_URL || 'https://open.er-api.com/v6/latest',
  FOREX_API_KEY: process.env.FOREX_API_KEY || '',
  RATE_CACHE_TTL_SECONDS: parseInt(process.env.RATE_CACHE_TTL_SECONDS, 10) || 300,

  // Transfer simulation
  TRANSFER_PROCESSING_DELAY_MS: parseInt(process.env.TRANSFER_PROCESSING_DELAY_MS, 10) || 5000,
  TRANSFER_FAILURE_RATE: parseFloat(process.env.TRANSFER_FAILURE_RATE) || 0.05,

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,

  // Seed
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@globalpay.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'ChangeMe123!',

  // Helpers
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV !== 'production',
  isFirebaseConfigured() {
    return !!(this.FIREBASE_PROJECT_ID && this.FIREBASE_CLIENT_EMAIL && this.FIREBASE_PRIVATE_KEY);
  },
};

module.exports = env;
