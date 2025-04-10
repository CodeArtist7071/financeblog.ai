import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// User registration validation rules
export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// User login validation rules
export const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
];

// Middleware to validate the request and return errors if any
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};