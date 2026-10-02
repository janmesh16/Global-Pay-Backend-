const mongoose = require('mongoose');
const logger = require('../utils/logger');
const env = require('./env');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || env.MONGO_URI;
    console.log('[CONNECTING TO URI]:', uri);
    const conn = await mongoose.connect(uri, {
      retryWrites: false,
      driverInfo: { name: 'Mongoose', version: mongoose.version || '9.0.0' },
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`[db] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`[db] MongoDB connection error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('[db] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error(`[db] MongoDB error: ${err.message}`);
});

module.exports = connectDB;
