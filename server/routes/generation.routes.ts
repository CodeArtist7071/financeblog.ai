import express from 'express';
import {
  scheduleGeneration,
  getScheduledGenerations,
  cancelScheduledGeneration
} from '../controllers/generation.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = express.Router();

// All routes are admin-only
router.use(protect, admin);

router.route('/schedule')
  .post(scheduleGeneration)
  .get(getScheduledGenerations);

router.delete('/schedule/:id', cancelScheduledGeneration);

export default router;