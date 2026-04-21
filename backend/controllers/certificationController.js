import db from '../models/index.js';

const Certification = db.Certification;

export const getAllCertifications = async (req, res) => {
  try {
    const certifications = await Certification.findAll({
      order: [['order', 'ASC'], ['displayName', 'ASC']]
    });
    res.json(certifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCertificationById = async (req, res) => {
  try {
    const certification = await Certification.findByPk(req.params.id);
    if (certification) {
      res.json(certification);
    } else {
      res.status(404).json({ message: 'Certification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCertification = async (req, res) => {
  try {
    const certification = await Certification.create(req.body);
    res.status(201).json(certification);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Certification name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateCertification = async (req, res) => {
  try {
    const certification = await Certification.findByPk(req.params.id);
    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }
    await certification.update(req.body);
    res.json(certification);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Certification name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteCertification = async (req, res) => {
  try {
    const certification = await Certification.findByPk(req.params.id);
    if (certification) {
      await certification.destroy();
      res.json({ message: 'Certification deleted' });
    } else {
      res.status(404).json({ message: 'Certification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
