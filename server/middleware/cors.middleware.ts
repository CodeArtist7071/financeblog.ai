import { Request, Response, NextFunction } from 'express';

/**
 * Custom CORS middleware to ensure proper headers on all responses
 * This ensures CORS headers are consistently applied even on error responses
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Set headers for CORS
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'];
    
  const origin = req.headers.origin;
  
  // Check if the origin is in our allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Cron-Secret');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  next();
};

export default corsMiddleware;