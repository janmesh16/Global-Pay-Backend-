const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const { initFirebase } = require('./config/firebase');
const socketService = require('./services/socket.service');
const logger = require('./utils/logger');

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.io
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true,
  },
});
socketService.init(io);

const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Firebase Admin SDK
    initFirebase();

    // Start listening
    server.listen(env.PORT, () => {
      logger.info(`[server] GlobalPay API running on port ${env.PORT} (${env.NODE_ENV})`);
      logger.info(`[server] Health: http://localhost:${env.PORT}/health`);
      logger.info(`[server] Docs:   http://localhost:${env.PORT}/api-docs`);
    });
  } catch (error) {
    logger.error(`[server] Failed to start: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`[server] ${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('[server] HTTP server closed');
    try {
      await mongoose.connection.close();
      logger.info('[server] MongoDB connection closed');
    } catch (err) {
      logger.error(`[server] Error closing DB: ${err.message}`);
    }
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('[server] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('[server] Unhandled Rejection:', reason);
  shutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (error) => {
  logger.error('[server] Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

start();

module.exports = server;
