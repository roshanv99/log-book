import fs from 'fs';
import path from 'path';
import pool from '../config/db';

// Path to SQL file
const sqlFilePath = path.join(__dirname, 'init.sql');

// Function to initialize database
const initDatabase = async (): Promise<void> => {
  try {
    console.log('Initializing database...');
    
    // Read SQL file
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute SQL
    await pool.query(sql);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Run initialization
initDatabase();

export default initDatabase; 