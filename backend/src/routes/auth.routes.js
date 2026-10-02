const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
  firebaseSchema,
  fcmTokenSchema,
} = require('../validators/auth.validator');

// Public routes (with strict rate limit)
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/firebase', authLimiter, validate(firebaseSchema), authController.firebaseAuth);

// Protected routes
router.get('/me', auth, authController.me);
router.post('/fcm-token', auth, validate(fcmTokenSchema), authController.addFcmToken);
router.delete('/fcm-token', auth, validate(fcmTokenSchema), authController.removeFcmToken);

module.exports = router;
