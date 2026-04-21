import db from '../models/index.js';

const Cut = db.Cut;

export const getAllCuts = async (req, res) => {
  try {
    const cuts = await Cut.findAll({
      order: [['order', 'ASC'], ['displayName', 'ASC']]
    });
    res.json(cuts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCutById = async (req, res) => {
  try {
    const cut = await Cut.findByPk(req.params.id);
    if (cut) {
      res.json(cut);
    } else {
      res.status(404).json({ message: 'Cut not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCut = async (req, res) => {
  try {
    const cut = await Cut.create(req.body);
    res.status(201).json(cut);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Cut name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateCut = async (req, res) => {
  try {
    const cut = await Cut.findByPk(req.params.id);
    if (!cut) {
      return res.status(404).json({ message: 'Cut not found' });
    }
    await cut.update(req.body);
    res.json(cut);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Cut name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteCut = async (req, res) => {
  try {
    const cut = await Cut.findByPk(req.params.id);
    if (cut) {
      await cut.destroy();
      res.json({ message: 'Cut deleted' });
    } else {
      res.status(404).json({ message: 'Cut not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
