import { Op } from 'sequelize';
import ContactMessage from '../models/ContactMessage.js';

// Get all contact messages (Admin only)
export const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, read, spam, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (read !== undefined) {
      where.read = read === 'true';
    }
    
    if (spam !== undefined) {
      where.spam = spam === 'true';
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { message: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await ContactMessage.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    res.json({
      messages: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single message (Admin only)
export const getMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark message as read (Admin only)
export const markAsRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.update({ read: true, status: 'Read' });

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark message as spam (Admin only)
export const markAsSpam = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.update({ spam: true, read: true, status: 'Read' });

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark message as not spam (Admin only)
export const markAsNotSpam = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.update({ spam: false });

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete message (Admin only)
export const deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.destroy();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get message statistics (Admin only)
export const getStats = async (req, res) => {
  try {
    const total = await ContactMessage.count();
    const unread = await ContactMessage.count({ where: { read: false } });
    const spam = await ContactMessage.count({ where: { spam: true } });
    const today = await ContactMessage.count({
      where: {
        createdAt: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    });

    res.json({
      total,
      unread,
      spam,
      today
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
