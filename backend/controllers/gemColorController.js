import db from '../models/index.js';

const GemColor = db.GemColor;

export const getAllGemColors = async (req, res) => {
  try {
    const colors = await GemColor.findAll({
      order: [['order', 'ASC'], ['displayName', 'ASC']]
    });
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGemColorById = async (req, res) => {
  try {
    const color = await GemColor.findByPk(req.params.id);
    if (color) {
      res.json(color);
    } else {
      res.status(404).json({ message: 'Gem color not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGemColor = async (req, res) => {
  try {
    const color = await GemColor.create(req.body);
    res.status(201).json(color);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Gem color name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateGemColor = async (req, res) => {
  try {
    const color = await GemColor.findByPk(req.params.id);
    if (!color) {
      return res.status(404).json({ message: 'Gem color not found' });
    }
    await color.update(req.body);
    res.json(color);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Gem color name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteGemColor = async (req, res) => {
  try {
    const color = await GemColor.findByPk(req.params.id);
    if (color) {
      await color.destroy();
      res.json({ message: 'Gem color deleted' });
    } else {
      res.status(404).json({ message: 'Gem color not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
