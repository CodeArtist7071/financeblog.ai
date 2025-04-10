import express from 'express';
import {
  submitTopic,
  getTopics,
  scheduleTopic,
  updateTopicStatus,
  deleteTopic
} from '../controllers/topic.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/submit', submitTopic);

// Admin routes
router.get('/', protect, admin, getTopics);
router.post('/:id/schedule', protect, admin, scheduleTopic);
router.patch('/:id/status', protect, admin, updateTopicStatus);
router.delete('/:id', protect, admin, deleteTopic);

export default router;