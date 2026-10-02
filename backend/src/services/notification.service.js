const admin = require('firebase-admin');
const User = require('../models/User');
const { isFirebaseReady } = require('../config/firebase');
const logger = require('../utils/logger');

const sendPushToUser = async (userId, title, body, data = {}) => {
  try {
    if (!isFirebaseReady()) {
      logger.debug(`[notification] Firebase not configured. Skipping push to ${userId}: ${title}`);
      return;
    }

    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      logger.debug(`[notification] No FCM tokens for user ${userId}`);
      return;
    }

    const message = {
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      tokens: user.fcmTokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code;
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(user.fcmTokens[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        await User.findByIdAndUpdate(userId, {
          $pullAll: { fcmTokens: invalidTokens },
        });
        logger.info(`[notification] Removed ${invalidTokens.length} invalid FCM tokens for user ${userId}`);
      }
    }

    logger.info(`[notification] Push sent to ${userId}: ${title} (${response.successCount}/${user.fcmTokens.length} delivered)`);
  } catch (error) {
    logger.error(`[notification] Push error for ${userId}: ${error.message}`);
  }
};

const sendToUser = (userId, payload, data = {}) => {
  const title = typeof payload === 'string' ? payload : payload.title;
  const body = typeof payload === 'string' ? '' : payload.body;
  return sendPushToUser(userId, title, body, data);
};

const notifyTransferCreated = (userId, transfer) => {
  return sendPushToUser(userId, 'Transfer Initiated', `Your transfer of ${transfer.amount} ${transfer.sourceCurrency} is being processed.`, {
    type: 'transfer_created',
    transactionId: transfer._id.toString(),
    status: transfer.status,
  });
};

const notifyTransferCompleted = (userId, transfer) => {
  return sendPushToUser(userId, 'Transfer Completed', `Your transfer ${transfer.reference} has been completed successfully.`, {
    type: 'transfer_completed',
    transactionId: transfer._id.toString(),
    status: 'completed',
  });
};

const notifyTransferFailed = (userId, transfer) => {
  return sendPushToUser(userId, 'Transfer Failed', `Your transfer ${transfer.reference} has failed. Funds have been refunded.`, {
    type: 'transfer_failed',
    transactionId: transfer._id.toString(),
    status: 'failed',
  });
};

const notifyTransferFlagged = (userId, transfer) => {
  return sendPushToUser(userId, 'Transfer Under Review', `Your transfer ${transfer.reference} is under compliance review.`, {
    type: 'transfer_flagged',
    transactionId: transfer._id.toString(),
    status: 'pending',
  });
};

const notifyKycUpdated = (userId, kycStatus) => {
  return sendPushToUser(userId, 'KYC Status Updated', `Your KYC status has been updated to: ${kycStatus}`, {
    type: 'kyc_updated',
    kycStatus,
  });
};

const notifyWalletCredited = (userId, amount, currency) => {
  return sendPushToUser(userId, 'Wallet Credited', `${amount} ${currency} has been added to your wallet.`, {
    type: 'wallet_credited',
    amount: String(amount),
    currency,
  });
};

module.exports = {
  sendPushToUser,
  sendToUser,
  notifyTransferCreated,
  notifyTransferCompleted,
  notifyTransferFailed,
  notifyTransferFlagged,
  notifyKycUpdated,
  notifyWalletCredited,
};
