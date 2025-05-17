import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

// JWT Secret from environment variables or default
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_this_in_production';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authorization token required' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Check if user exists
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    
    // Add user ID to request
    req.user = { id: user.id };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}; 