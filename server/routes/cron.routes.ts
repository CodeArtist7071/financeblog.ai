import express from 'express';
import { dailyContentGeneration } from '../controllers/cron.controller';

const router = express.Router();

// Cron job routes - protected by secret in controller
router.get('/daily-generate', dailyContentGeneration);

export default router;