import express from 'express';
import {
  adminLogin,
  getCurrentAdmin,
  registerAdmin,
  requestVerificationCode,
  resetPasswordWithCode,
  forgotPasswordRequest,
  forgotPasswordReset
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/register', registerAdmin); // Remove or protect in production
router.get('/me', protect, getCurrentAdmin);
router.post('/request-code', protect, requestVerificationCode);
router.post('/change-password', protect, resetPasswordWithCode);
router.post('/forgot-password', forgotPasswordRequest);
router.post('/reset-password', forgotPasswordReset);

export default router;

