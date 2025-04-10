import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '@shared/schema';

// Make sure to set these in your environment variables for production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
const SALT_ROUNDS = 10;

export interface JwtPayload {
  userId: number;
  email: string;
  isAdmin: boolean;
}

/**
 * Hash a password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
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

/**
 * Generate a JWT token for a user
 */
export const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Verify a JWT token and return the decoded payload
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};