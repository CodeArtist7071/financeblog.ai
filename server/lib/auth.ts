import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '@shared/schema';

// Environment variables for JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Interface for JWT payload
export interface JwtPayload {
  userId: number;
  email: string;
  isAdmin: boolean;
}

/**
 * Generate a JWT token for a user
 */
export const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY
  });
};

/**
 * Verify a JWT token and return the decoded payload
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

/**
 * Hash a password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a password with a hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};