import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import AdminUser from '../models/AdminUser.js';

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
      attributes: { exclude: ['password'] }
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
