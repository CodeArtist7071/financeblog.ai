import express from 'express';
import {
  login,
  register,
  logout,
  getCurrentUser,
  verifyToken
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { loginValidation, registerValidation, validate } from '../middleware/validation.middleware';

const router = express.Router();

// Public routes
router.post('/login', loginValidation, validate, login);
router.post('/register', registerValidation, validate, register);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);
router.get('/verify', protect, verifyToken);

export default router;