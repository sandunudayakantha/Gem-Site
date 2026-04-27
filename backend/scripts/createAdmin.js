import { Op } from 'sequelize';
import dotenv from 'dotenv';
import db from '../models/index.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const AdminUser = db.AdminUser;

// Default admin credentials from .env or fallback
const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@asgems.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

async function createAdmin() {
  try {
    console.log('Connecting to MySQL...');
    await db.sequelize.authenticate();
    console.log('✅ Connected to MySQL\n');

    // Sync models
    await db.sequelize.sync();

    // Check if admin already exists
    let admin = await AdminUser.findOne({
      where: {
        [Op.or]: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }]
      }
    });

    if (admin) {
      console.log('🔄  Admin user already exists. Updating credentials...');
      
      admin.email = ADMIN_EMAIL;
      admin.password = ADMIN_PASSWORD; // Model hook will hash this
      
      await admin.save();
      
      console.log('✅ Admin user updated successfully!\n');
    } else {
      // Create new admin
      admin = await AdminUser.create({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });
      console.log('✅ Admin user created successfully!\n');
    }
    
    console.log('📋 Admin Credentials:');
    console.log('   Username:', ADMIN_USERNAME);
    console.log('   Email:   ', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('\n🌐 Login at: http://localhost:5174/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error managing admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
