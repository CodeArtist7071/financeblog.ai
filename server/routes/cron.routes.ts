import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { dailyContentGeneration } from '../controllers/cron.controller';

const router = express.Router();

// Middleware to verify cron secret
const verifyCronSecret = (req: Request, res: Response, next: NextFunction) => {
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(403).json({ error: 'Unauthorized - Invalid cron secret' });
  }
  next();
};

// Apply secret verification to all cron routes
router.use(verifyCronSecret);

// Cron job routes
router.get('/daily-generate', dailyContentGeneration);

// Health check route for cron jobs (useful for monitoring)
router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

export default router;