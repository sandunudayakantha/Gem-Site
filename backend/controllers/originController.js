import db from '../models/index.js';

const Origin = db.Origin;

export const getAllOrigins = async (req, res) => {
  try {
    const origins = await Origin.findAll({
      order: [['order', 'ASC'], ['displayName', 'ASC']]
    });
    res.json(origins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOriginById = async (req, res) => {
  try {
    const origin = await Origin.findByPk(req.params.id);
    if (origin) {
      res.json(origin);
    } else {
      res.status(404).json({ message: 'Origin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrigin = async (req, res) => {
  try {
    const origin = await Origin.create(req.body);
    res.status(201).json(origin);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Origin name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateOrigin = async (req, res) => {
  try {
    const origin = await Origin.findByPk(req.params.id);
    if (!origin) {
      return res.status(404).json({ message: 'Origin not found' });
    }
    await origin.update(req.body);
    res.json(origin);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Origin name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteOrigin = async (req, res) => {
  try {
    const origin = await Origin.findByPk(req.params.id);
    if (origin) {
      await origin.destroy();
      res.json({ message: 'Origin deleted' });
    } else {
      res.status(404).json({ message: 'Origin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
