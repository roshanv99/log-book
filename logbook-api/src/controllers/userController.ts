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

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - currency_id
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               mobile_number:
 *                 type: string
 *               profile_pic:
 *                 type: string
 *               currency_id:
 *                 type: integer
 *               monthly_start_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, mobile_number, profile_pic, currency_id, monthly_start_date } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !currency_id) {
      res.status(400).json({ message: 'Username, email, password, and currency_id are required' });
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
      mobile_number,
      profile_pic,
      currency_id,
      monthly_start_date
    };
    
    const newUser = await UserModel.create(userData);
    
    // Generate token
    const token = generateToken(newUser.user_id.toString());
    
    // Return user data and token
    res.status(201).json({
      message: 'User created successfully',
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
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
    const isPasswordValid = await UserModel.verifyPassword(password, user.password_hash);
    console.log('Password valid:', isPasswordValid ? 'yes' : 'no');
    if (!isPasswordValid) {
      console.log('Invalid credentials - password incorrect');
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Update last login
    await UserModel.updateLastLogin(user.user_id);
    
    // Generate token
    console.log('Generating token');
    const token = generateToken(user.user_id.toString());
    
    // Return user data without password and token
    const { password_hash: _, ...userWithoutPassword } = user;
    
    console.log('Login successful');
    res.status(200).json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // The user ID is added by the auth middleware
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    // Find user by ID
    const user = await UserModel.findById(parseInt(userId));
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({
      message: 'Profile retrieved successfully',
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        mobile_number: user.mobile_number,
        profile_pic: user.profile_pic,
        currency_id: user.currency_id,
        monthly_start_date: user.monthly_start_date,
        last_login: user.last_login
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error retrieving profile' });
  }
};

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile_number:
 *                 type: string
 *               profile_pic:
 *                 type: string
 *               currency_id:
 *                 type: integer
 *               monthly_start_date:
 *                 type: string
 *                 format: date
 *             required:
 *               - username
 *               - email
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // The user ID is added by the auth middleware
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const { username, email, password, mobile_number, profile_pic, currency_id, monthly_start_date } = req.body;
    
    // Update user
    const updatedUser = await UserModel.updateUser(parseInt(userId), {
      username,
      email,
      password,
      mobile_number,
      profile_pic,
      currency_id,
      monthly_start_date
    });
    
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        user_id: updatedUser.user_id,
        username: updatedUser.username,
        email: updatedUser.email,
        mobile_number: updatedUser.mobile_number,
        profile_pic: updatedUser.profile_pic,
        currency_id: updatedUser.currency_id,
        monthly_start_date: updatedUser.monthly_start_date,
        last_login: updatedUser.last_login
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
}; 