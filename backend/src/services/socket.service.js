const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../utils/logger');

let io = null;

/**
 * Initialize socket service with the io instance.
 */
const init = (ioInstance) => {
  io = ioInstance;

  // Socket Auth Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id || socket.user?._id;
    if (userId) {
      socket.join(`user:${userId}`);
      if (socket.user.role === 'admin') {
        socket.join('admins');
      }
      logger.info(`[socket] User ${userId} connected to socket (id: ${socket.id})`);
    }

    socket.on('subscribe:transfer', (transferId) => {
      socket.join(`transfer:${transferId}`);
    });

    socket.on('unsubscribe:transfer', (transferId) => {
      socket.leave(`transfer:${transferId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`[socket] Socket ${socket.id} disconnected`);
    });
  });

  logger.info('[socket] Socket service initialized with JWT auth handler');
};

/**
 * Get the io instance.
 */
const getIO = () => io;

/**
 * Emit event to a specific user's room.
 */
const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId.toString()}`).emit(event, data);
};

const sendToUser = emitToUser;

/**
 * Emit event to all admins.
 */
const emitToAdmins = (event, data) => {
  if (!io) return;
  io.to('admins').emit(event, data);
};

/**
 * Emit transfer status to relevant rooms.
 */
const emitTransferStatus = (transfer) => {
  if (!io) return;
  const payload = {
    id: transfer._id,
    reference: transfer.reference,
    status: transfer.status,
    complianceStatus: transfer.complianceStatus,
    failureReason: transfer.failureReason || undefined,
    updatedAt: transfer.updatedAt,
  };
  emitToUser(transfer.sender.toString(), 'transfer:status', payload);
  io.to(`transfer:${transfer._id}`).emit('transfer:status', payload);
  emitToAdmins('transfer:status', payload);
};

/**
 * Emit wallet update to user.
 */
const emitWalletUpdate = (userId, balance, currency) => {
  emitToUser(userId, 'wallet:updated', { balance, currency });
};

module.exports = {
  init,
  getIO,
  emitToUser,
  sendToUser,
  emitToAdmins,
  emitTransferStatus,
  emitWalletUpdate,
};
