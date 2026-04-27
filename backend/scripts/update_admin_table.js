import db from '../models/index.js';

async function safelyUpdateAdminTable() {
  try {
    console.log('Connecting to MySQL...');
    await db.sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    console.log('Checking and updating AdminUser table columns...');
    
    // Check if columns exist first to avoid errors
    const [results] = await db.sequelize.query("SHOW COLUMNS FROM AdminUsers");
    const columns = results.map(r => r.Field);
    
    if (!columns.includes('verificationCode')) {
      console.log('Adding verificationCode column...');
      await db.sequelize.query("ALTER TABLE AdminUsers ADD COLUMN verificationCode VARCHAR(255) NULL");
    }
    
    if (!columns.includes('verificationCodeExpires')) {
      console.log('Adding verificationCodeExpires column...');
      await db.sequelize.query("ALTER TABLE AdminUsers ADD COLUMN verificationCodeExpires DATETIME NULL");
    }
    
    console.log('✅ AdminUsers table is up to date!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating table:', error.message);
    process.exit(1);
  }
}

safelyUpdateAdminTable();
