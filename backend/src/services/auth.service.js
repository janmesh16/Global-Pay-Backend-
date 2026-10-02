const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const env = require('../config/env');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const ApiError = require('../utils/ApiError');
const { isFirebaseReady } = require('../config/firebase');
const logger = require('../utils/logger');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

const getSessionIfReplicaSet = async () => {
  try {
    const topologyType = mongoose.connection.client?.topology?.description?.type;
    if (topologyType && topologyType !== 'Single') {
      const session = await mongoose.startSession();
      session.startTransaction();
      return session;
    }
  } catch (err) {
    // Fallback to null for standalone
  }
  return null;
};

const register = async ({ name, email, password, country, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const session = await getSessionIfReplicaSet();

  try {
    const opts = session ? { session } : {};

    const [user] = await User.create(
      [{ name, email, password, country, phone }],
      opts
    );

    await Wallet.create(
      [{ user: user._id, balance: mongoose.Types.Decimal128.fromString('0.00'), currency: 'USD' }],
      opts
    );

    if (isFirebaseReady()) {
      try {
        const fbUser = await admin.auth().createUser({
          email,
          password,
          displayName: name,
        });
        user.firebaseUid = fbUser.uid;
        await user.save(opts);
      } catch (fbError) {
        logger.warn(`[auth] Firebase mirror failed: ${fbError.message}`);
      }
    }

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    const token = generateToken(user);
    return { user: user.toJSON(), token };
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.status !== 'active') {
    throw ApiError.forbidden(`Your account is ${user.status}. Contact support.`);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user);
  return { user: user.toJSON(), token };
};

const firebaseLogin = async (idToken) => {
  if (!isFirebaseReady()) {
    throw ApiError.badRequest('Firebase authentication is not configured');
  }

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    throw ApiError.unauthorized('Invalid Firebase token');
  }

  const { uid, email, name } = decodedToken;

  let user = await User.findOne({
    $or: [{ firebaseUid: uid }, { email }],
  });

  if (user) {
    if (!user.firebaseUid) {
      user.firebaseUid = uid;
    }
    user.lastLoginAt = new Date();
    await user.save();
  } else {
    const session = await getSessionIfReplicaSet();
    try {
      const opts = session ? { session } : {};
      [user] = await User.create(
        [{
          name: name || email.split('@')[0],
          email,
          firebaseUid: uid,
          country: 'US',
        }],
        opts
      );

      await Wallet.create(
        [{ user: user._id, balance: mongoose.Types.Decimal128.fromString('0.00'), currency: 'USD' }],
        opts
      );

      if (session) {
        await session.commitTransaction();
        session.endSession();
      }
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  }

  if (user.status !== 'active') {
    throw ApiError.forbidden(`Your account is ${user.status}. Contact support.`);
  }

  const token = generateToken(user);
  return { user: user.toJSON(), token };
};

const addFcmToken = async (userId, token) => {
  await User.findByIdAndUpdate(userId, {
    $addToSet: { fcmTokens: token },
  });
};

const removeFcmToken = async (userId, token) => {
  await User.findByIdAndUpdate(userId, {
    $pull: { fcmTokens: token },
  });
};

module.exports = { generateToken, register, login, firebaseLogin, addFcmToken, removeFcmToken };
