import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { UserInput } from '../models/User';

// JWT Secret from environment variables or default
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_this_in_production';
const JWT_EXPIRES_IN:string | any = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT Token
const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId }, 
    Buffer.from(JWT_SECRET),
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, first_name, last_name } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      res.status(400).json({ message: 'Username, email, and password are required' });
      return;
    }
    
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }
    
    // Create new user
    const userData: UserInput = {
      username,
      email,
      password,
      first_name,
      last_name
    };
    
    const newUser = await UserModel.create(userData);
    
    // Generate token
    const token = generateToken(newUser.id);
    
    // Return user data and token
    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      console.log('Missing email or password');
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    
    // Find user by email
    console.log('Finding user by email:', email);
    const user = await UserModel.findByEmail(email);
    console.log('User found:', user ? 'yes' : 'no');
    if (!user) {
      console.log('Invalid credentials - user not found');
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Verify password
    console.log('Verifying password');
    const isPasswordValid = await UserModel.verifyPassword(password, user.password);
    console.log('Password valid:', isPasswordValid ? 'yes' : 'no');
    if (!isPasswordValid) {
      console.log('Invalid credentials - password incorrect');
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Generate token
    console.log('Generating token');
    const token = generateToken(user.id);
    
    // Return user data without password and token
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('Login successful');
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // The user ID is added by the auth middleware
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    // Find user by ID
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({
      message: 'Profile retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error retrieving profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // The user ID is added by the auth middleware
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const { username, email, password, first_name, last_name } = req.body;
    
    // Update user
    const updatedUser = await UserModel.updateUser(userId, {
      username,
      email,
      password,
      first_name,
      last_name
    });
    
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
}; 