import express from 'express';
import {
  getPendingComments,
  approveComment,
  deleteComment
} from '../controllers/comment.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = express.Router();

// Admin routes
router.get('/pending', protect, admin, getPendingComments);
router.patch('/:id/approve', protect, admin, approveComment);
router.delete('/:id', protect, admin, deleteComment);

export default router;