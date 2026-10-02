const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileSchema, submitKycSchema, deviceTokenSchema } = require('../validators/user.validator');

router.use(auth);

router.get('/profile', userController.getProfile);
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);
router.post('/kyc', validate(submitKycSchema), userController.submitKyc);
router.post('/device-token', validate(deviceTokenSchema), userController.registerDeviceToken);

module.exports = router;
