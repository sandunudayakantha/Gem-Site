import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import AdminUser from '../models/AdminUser.js';
import { sendVerificationEmail } from '../utils/emailService.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const admin = await AdminUser.findOne({ 
      where: {
        [Op.or]: [{ username }, { email: username }] 
      }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(admin.id);

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current admin (protected)
export const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await AdminUser.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'verificationCode', 'verificationCodeExpires'] }
    });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register admin (for initial setup - remove in production or protect with super admin)
export const registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const existingAdmin = await AdminUser.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await AdminUser.create({
      username,
      email,
      password
    });

    const token = generateToken(admin.id);

    res.status(201).json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Request Verification Code
export const requestVerificationCode = async (req, res) => {
  try {
    const admin = await AdminUser.findByPk(req.user.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Generate 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    admin.verificationCode = verificationCode;
    admin.verificationCodeExpires = expiration;
    await admin.save();

    // Send email
    await sendVerificationEmail(admin.email, verificationCode);

    res.json({ message: 'Verification code sent to email' });
  } catch (error) {
    console.error('Error in requestVerificationCode:', error);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
};

// Reset Password with Code
export const resetPasswordWithCode = async (req, res) => {
  try {
    const { code, newPassword } = req.body;

    if (!code || !newPassword) {
      return res.status(400).json({ message: 'Please provide code and new password' });
    }

    const admin = await AdminUser.findByPk(req.user.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify code and check expiration
    if (admin.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (new Date() > admin.verificationCodeExpires) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // Update password
    admin.password = newPassword;
    admin.verificationCode = null;
    admin.verificationCodeExpires = null;
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in resetPasswordWithCode:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
};
