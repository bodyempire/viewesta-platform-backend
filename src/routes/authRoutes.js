import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  requestVerification,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, authValidation } from '../utils/validation.js';

const router = express.Router();

router.post('/register', validate(authValidation.register), register);
router.post('/login', validate(authValidation.login), login);
router.post('/request-verify', validate(authValidation.requestPasswordReset), requestVerification);
router.post('/verify', validate(authValidation.verifyEmail), verifyEmail);
router.post('/request-reset', validate(authValidation.requestPasswordReset), requestPasswordReset);
router.post('/reset', validate(authValidation.resetPassword), resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, validate(authValidation.updateProfile), updateProfile);
router.put('/change-password', protect, validate(authValidation.changePassword), changePassword);

export default router;

