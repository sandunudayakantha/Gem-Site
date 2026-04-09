import { Op } from 'sequelize';
import Size from '../models/Size.js';
import Category from '../models/Category.js';

// Get all sizes
export const getSizes = async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { 
      [Op.or]: [{ categoryId: category }, { categoryId: null }] 
    } : {};
    
    const sizes = await Size.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      order: [['order', 'ASC'], ['name', 'ASC']]
    });
    
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single size
export const getSize = async (req, res) => {
  try {
    const size = await Size.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category', attributes: ['name'] }]
    });
    
    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }
    
    res.json(size);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create size (Admin only)
export const createSize = async (req, res) => {
  try {
    const { name, displayName, category, order } = req.body;
    
    if (!name || !displayName) {
      return res.status(400).json({ message: 'Name and display name are required' });
    }

    const size = await Size.create({
      name: name.toUpperCase().trim(),
      displayName: displayName.trim(),
      categoryId: category || null,
      order: order || 0
    });

    const freshSize = await Size.findByPk(size.id, {
      include: [{ model: Category, as: 'category', attributes: ['name'] }]
    });
    
    res.status(201).json(freshSize);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Size with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Update size (Admin only)
export const updateSize = async (req, res) => {
  try {
    const size = await Size.findByPk(req.params.id);
    
    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }

    const updateData = { ...req.body };
    
    if (updateData.name) {
      updateData.name = updateData.name.toUpperCase().trim();
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

    await size.update(updateData);
    
    const freshSize = await Size.findByPk(size.id, {
      include: [{ model: Category, as: 'category', attributes: ['name'] }]
    });

    res.json(freshSize);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Size with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete size (Admin only)
export const deleteSize = async (req, res) => {
  try {
    const size = await Size.findByPk(req.params.id);
    
    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }

    await size.destroy();
    res.json({ message: 'Size deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
