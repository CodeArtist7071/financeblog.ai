import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser
} from '../controllers/user.controller';
import { protect, admin } from '../middleware/auth.middleware';
import { registerValidation, loginValidation, validate } from '../middleware/validation.middleware';

const router = express.Router();

// Public routes
router.post('/', registerValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);

// Private routes
router.post('/logout', protect, logoutUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin routes
router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;