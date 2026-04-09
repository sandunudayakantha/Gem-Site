import { Op } from 'sequelize';
import Color from '../models/Color.js';
import Category from '../models/Category.js';

// Get all colors
export const getColors = async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { 
      [Op.or]: [{ categoryId: category }, { categoryId: null }] 
    } : {};
    
    const colors = await Color.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      order: [['order', 'ASC'], ['name', 'ASC']]
    });
    
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single color
export const getColor = async (req, res) => {
  try {
    const color = await Color.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category', attributes: ['name'] }]
    });
    
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }
    
    res.json(color);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create color (Admin only)
export const createColor = async (req, res) => {
  try {
    const { name, displayName, hexCode, category, order } = req.body;
    
    if (!name || !displayName) {
      return res.status(400).json({ message: 'Name and display name are required' });
    }

    const color = await Color.create({
      name: name.toLowerCase().trim(),
      displayName: displayName.trim(),
      hexCode: hexCode || '#000000',
      categoryId: category || null,
      order: order || 0
    });

    const freshColor = await Color.findByPk(color.id, {
      include: [{ model: Category, as: 'category', attributes: ['name'] }]
    });
    
    res.status(201).json(freshColor);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Color with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Update color (Admin only)
export const updateColor = async (req, res) => {
  try {
    const color = await Color.findByPk(req.params.id);
    
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }

    const updateData = { ...req.body };
    
    if (updateData.name) {
      updateData.name = updateData.name.toLowerCase().trim();
    }
    if (updateData.displayName) {
      updateData.displayName = updateData.displayName.trim();
    }
    if (updateData.category !== undefined) {
      updateData.categoryId = updateData.category || null;
    }
    if (updateData.order !== undefined) {
      updateData.order = parseInt(updateData.order);
    }

    await color.update(updateData);
    
    const freshColor = await Color.findByPk(color.id, {
      include: [{ model: Category, as: 'category', attributes: ['name'] }]
    });

    res.json(freshColor);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Color with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete color (Admin only)
export const deleteColor = async (req, res) => {
  try {
    const color = await Color.findByPk(req.params.id);
    
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }

    await color.destroy();
    res.json({ message: 'Color deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
