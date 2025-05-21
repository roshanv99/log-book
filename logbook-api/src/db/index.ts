import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let db: Database | undefined;

export const initializeDb = async () => {
  try {
    if (!db) {
      console.log('Initializing database...');
      // Ensure data directory exists
      const dataDir = path.join(__dirname, '../../data');
      if (!fs.existsSync(dataDir)) {
        console.log('Creating data directory...');
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const dbPath = path.join(dataDir, 'logbook.db');
      console.log('Database path:', dbPath);

      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });
      
      console.log('Database connection established');
      
      // Enable foreign keys
      await db.run('PRAGMA foreign_keys = ON');
      console.log('Foreign keys enabled');

      // Read and execute initialization script
      const initScriptPath = path.join(__dirname, 'init.sql');
      console.log('Reading init script from:', initScriptPath);
      const initScript = fs.readFileSync(initScriptPath, 'utf8');
      await db.exec(initScript);
      console.log('Database initialization completed');
    }
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDb() first.');
  }
  return db;
}; 