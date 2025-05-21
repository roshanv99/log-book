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
  // Add connection timeout
  connectionTimeoutMillis: 5000,
  // Add idle timeout
  idleTimeoutMillis: 30000,
  // Maximum number of clients in the pool
  max: 20,
  // Minimum number of clients in the pool
  min: 4,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test the connection and handle reconnection
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    return true;
  } catch (err) {
    console.error('Error connecting to PostgreSQL database:', err);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Initial connection test
testConnection();

// Export a function to get a client from the pool
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

// Export the pool for direct use
export default pool; 