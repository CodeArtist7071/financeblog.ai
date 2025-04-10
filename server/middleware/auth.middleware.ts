import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/user.model';

export interface IJwtPayload {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

// Create JWT token
export const generateToken = (user: IUserDocument): string => {
  const payload: IJwtPayload = {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'default_secret_replace_this', {
    expiresIn: '30d'
  });
};

// Protect routes with authentication
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // Check if token exists in Authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret_replace_this'
    ) as IJwtPayload;

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      res.status(401).json({ error: 'Not authorized, user not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized, invalid token' });
  }
};

// Check if user is admin
export const admin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as admin' });
  }
};