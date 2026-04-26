import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function updateTable() {
  console.log('Connecting to MySQL to update Products table...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'sjclothing',
    });

    // Check if thumbnail column exists
    const [rows] = await connection.query('SHOW COLUMNS FROM Products LIKE "thumbnail"');
    
    if (rows.length === 0) {
      console.log('Adding "thumbnail" column to Products table...');
      await connection.query('ALTER TABLE Products ADD COLUMN thumbnail VARCHAR(255) NULL AFTER `images`');
      console.log('✅ Column "thumbnail" added successfully.');
    } else {
      console.log('ℹ️ Column "thumbnail" already exists.');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error updating table:', error.message);
    process.exit(1);
  }
}

updateTable();
