import express from 'express';

import {
  registerUser,
  loginUser,
  getMe,
} from '../controllers/authController';

import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register',protect, registerUser);
router.post('/login',protect, loginUser);

// Private route
router.get('/me', protect, getMe);

export default router;