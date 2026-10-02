/**
 * Seed script: creates admin user, default wallet, and global settings.
 * Usage: npm run seed
 */
const mongoose = require('mongoose');
const env = require('../src/config/env');
const logger = require('../src/utils/logger');
const User = require('../src/models/User');
const Wallet = require('../src/models/Wallet');
const Settings = require('../src/models/Settings');
const { ROLES, USER_STATUS, KYC_STATUS } = require('../src/utils/constants');

const seed = async () => {
  try {
    logger.info('[seed] Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    logger.info('[seed] Connected.');

    // 1. Create or update admin user
    let admin = await User.findOne({ email: env.ADMIN_EMAIL });
    if (!admin) {
      admin = await User.create({
        name: 'GlobalPay Admin',
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        country: 'US',
        role: ROLES.ADMIN,
        status: USER_STATUS.ACTIVE,
        kycStatus: KYC_STATUS.VERIFIED,
      });
      logger.info(`[seed] Admin user created: ${admin.email}`);
    } else {
      logger.info(`[seed] Admin user already exists: ${admin.email}`);
    }

    // 2. Create admin wallet if it doesn't exist
    let adminWallet = await Wallet.findOne({ user: admin._id });
    if (!adminWallet) {
      adminWallet = await Wallet.create({
        user: admin._id,
        balance: mongoose.Types.Decimal128.fromString('0.00'),
        currency: 'USD',
      });
      logger.info('[seed] Admin wallet created.');
    } else {
      logger.info('[seed] Admin wallet already exists.');
    }

    // 3. Create or update global settings
    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) {
      settings = await Settings.create({
        key: 'global',
        updatedBy: admin._id,
      });
      logger.info('[seed] Global settings created with defaults.');
    } else {
      logger.info('[seed] Global settings already exist.');
    }

    // 4. Create demo users (optional)
    const demoUsers = [
      { name: 'John Doe', email: 'john@example.com', password: 'Password123!', country: 'US' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'Password123!', country: 'GB' },
      { name: 'Raj Patel', email: 'raj@example.com', password: 'Password123!', country: 'IN' },
    ];

    for (const userData of demoUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        const user = await User.create(userData);
        await Wallet.create({
          user: user._id,
          balance: mongoose.Types.Decimal128.fromString('1000.00'),
          currency: 'USD',
        });
        logger.info(`[seed] Demo user created: ${userData.email} (balance: 1000 USD)`);
      } else {
        logger.info(`[seed] Demo user already exists: ${userData.email}`);
      }
    }

    logger.info('[seed] Seeding complete!');
    logger.info('[seed] Admin credentials:');
    logger.info(`[seed]   Email: ${env.ADMIN_EMAIL}`);
    logger.info(`[seed]   Password: ${env.ADMIN_PASSWORD}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error(`[seed] Error: ${error.message}`);
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
