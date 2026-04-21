import db from '../models/index.js';

const Clarity = db.Clarity;

export const getAllClarities = async (req, res) => {
  try {
    const clarities = await Clarity.findAll({
      order: [['order', 'ASC'], ['displayName', 'ASC']]
    });
    res.json(clarities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClarityById = async (req, res) => {
  try {
    const clarity = await Clarity.findByPk(req.params.id);
    if (clarity) {
      res.json(clarity);
    } else {
      res.status(404).json({ message: 'Clarity not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createClarity = async (req, res) => {
  try {
    const clarity = await Clarity.create(req.body);
    res.status(201).json(clarity);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Clarity name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateClarity = async (req, res) => {
  try {
    const clarity = await Clarity.findByPk(req.params.id);
    if (!clarity) {
      return res.status(404).json({ message: 'Clarity not found' });
    }
    await clarity.update(req.body);
    res.json(clarity);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Clarity name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteClarity = async (req, res) => {
  try {
    const clarity = await Clarity.findByPk(req.params.id);
    if (clarity) {
      await clarity.destroy();
      res.json({ message: 'Clarity deleted' });
    } else {
      res.status(404).json({ message: 'Clarity not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
