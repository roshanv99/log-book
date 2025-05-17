import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'logbook',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Connection parameters:', {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'logbook',
    user: process.env.DB_USER || 'postgres',
  });
  
  try {
    // Test connection
    const client = await pool.connect();
    console.log('Connected to database successfully');
    
    // Run a simple query
    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log('User count:', result.rows[0].count);
    
    // Release client
    client.release();
    
    // Close pool
    await pool.end();
    console.log('Connection pool closed');
  } catch (error) {
    console.error('Error testing database connection:', error);
  }
}

testConnection(); 