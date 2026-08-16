import express from 'express';
import {
  logout,
  createUser,
  login,
  getMe,
  updateUserProfile,
  changeUserPassword,
  sendOtp,
  verifyOtp
} from '../controllers/authController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create',protect, authorize('admin', 'super_admin'), createUser)
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/logout',protect, logout)
router.put('/profile', protect, updateUserProfile)
router.get('/me', protect, getMe);
router.patch('/change-password',protect ,changeUserPassword)

export default router;