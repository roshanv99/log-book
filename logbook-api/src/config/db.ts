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

// Test the connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch((err) => console.error('Error connecting to PostgreSQL database:', err));

export default pool; 