import pool from '../config/db';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface UserOutput {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
}

class UserModel {
  // Create user
  async create(userData: UserInput): Promise<UserOutput> {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    const query = `
      INSERT INTO users (username, email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, first_name, last_name, created_at, updated_at
    `;
    
    const values = [
      userData.username,
      userData.email,
      hashedPassword,
      userData.first_name || null,
      userData.last_name || null
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
  async findById(id: string): Promise<UserOutput | null> {
    const query = `
      SELECT id, username, email, first_name, last_name, created_at, updated_at
      FROM users WHERE id = $1
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
  async updateUser(id: string, userData: Partial<UserInput>): Promise<UserOutput | null> {
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
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      fields.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }
    
    if (userData.first_name !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(userData.first_name || null);
    }
    
    if (userData.last_name !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(userData.last_name || null);
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
      WHERE id = $${paramCount}
      RETURNING id, username, email, first_name, last_name, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }
}

export default new UserModel(); 