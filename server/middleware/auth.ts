import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../lib/auth';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT token in cookies or Authorization header
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Check for token in cookies first
  const tokenFromCookie = req.cookies.token;
  
  // Then check for token in Authorization header
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1]
    : null;
    
  // Use the token from either source
  const token = tokenFromCookie || tokenFromHeader;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  // Attach the user payload to the request
  req.user = payload;
  next();
};

/**
 * Middleware to check if the authenticated user is an admin
 * This middleware should be used after the authenticate middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  
  next();
};