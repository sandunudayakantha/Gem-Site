import express from 'express';
import { getAllGemColors, getGemColorById, createGemColor, updateGemColor, deleteGemColor } from '../controllers/gemColorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllGemColors)
  .post(protect, createGemColor);

router.route('/:id')
  .get(getGemColorById)
  .put(protect, updateGemColor)
  .delete(protect, deleteGemColor);

export default router;
