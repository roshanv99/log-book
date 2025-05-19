import pool from '../config/db';
import bcrypt from 'bcrypt';

export interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  mobile_number?: string;
  profile_pic?: string;
  currency_id?: number;
  monthly_start_date?: number;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
  mobile_number?: string;
  profile_pic?: string;
  currency_id?: number;
  monthly_start_date?: number;
}

export interface UserOutput {
  user_id: number;
  username: string;
  email: string;
  mobile_number?: string;
  profile_pic?: string;
  currency_id?: number;
  monthly_start_date?: number;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

class UserModel {
  // Create user
  async create(userData: UserInput): Promise<UserOutput> {
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(userData.password, saltRounds);
    
    const query = `
      INSERT INTO users (
        username, email, password_hash, mobile_number, 
        profile_pic, currency_id, monthly_start_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, username, email, mobile_number, 
        profile_pic, currency_id, monthly_start_date, 
        last_login, created_at, updated_at
    `;
    
    const values = [
      userData.username,
      userData.email,
      password_hash,
      userData.mobile_number || null,
      userData.profile_pic || null,
      userData.currency_id || null,
      userData.monthly_start_date || null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    console.log('Running findByEmail query for:', email);
    const query = 'SELECT * FROM users WHERE email = $1';
    console.log('Query:', query);
    try {
      const result = await pool.query(query, [email]);
      console.log('Query result rows:', result.rows.length);
      
      if (result.rows.length === 0) {
        console.log('No user found with this email');
        return null;
      }
      
      console.log('User found');
      return result.rows[0];
    } catch (error) {
      console.error('Database error in findByEmail:', error);
      throw error;
    }
  }
  
  // Find user by ID
  async findById(id: number): Promise<UserOutput | null> {
    const query = `
      SELECT user_id, username, email, mobile_number, 
        profile_pic, currency_id, monthly_start_date, 
        last_login, created_at, updated_at
      FROM users WHERE user_id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }
  
  // Verify password
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // Update user
  async updateUser(id: number, userData: Partial<UserInput>): Promise<UserOutput | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    // Build dynamic query based on provided fields
    if (userData.username) {
      fields.push(`username = $${paramCount++}`);
      values.push(userData.username);
    }
    
    if (userData.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }
    
    if (userData.password) {
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(userData.password, saltRounds);
      fields.push(`password_hash = $${paramCount++}`);
      values.push(password_hash);
    }
    
    if (userData.mobile_number !== undefined) {
      fields.push(`mobile_number = $${paramCount++}`);
      values.push(userData.mobile_number || null);
    }
    
    if (userData.profile_pic !== undefined) {
      fields.push(`profile_pic = $${paramCount++}`);
      values.push(userData.profile_pic || null);
    }
    
    if (userData.currency_id !== undefined) {
      fields.push(`currency_id = $${paramCount++}`);
      values.push(userData.currency_id || null);
    }
    
    if (userData.monthly_start_date !== undefined) {
      fields.push(`monthly_start_date = $${paramCount++}`);
      values.push(userData.monthly_start_date || null);
    }
    
    // Add updated_at
    fields.push(`updated_at = NOW()`);
    
    // If no fields to update
    if (fields.length === 0) {
      return this.findById(id);
    }
    
    // Add id as the last parameter
    values.push(id);
    
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING user_id, username, email, mobile_number, 
        profile_pic, currency_id, monthly_start_date, 
        last_login, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }
  
  // Update last login
  async updateLastLogin(id: number): Promise<void> {
    const query = `
      UPDATE users
      SET last_login = NOW()
      WHERE user_id = $1
    `;
    await pool.query(query, [id]);
  }
}

export default new UserModel(); 