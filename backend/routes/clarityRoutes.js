import express from 'express';
import { getAllClarities, getClarityById, createClarity, updateClarity, deleteClarity } from '../controllers/clarityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllClarities)
  .post(protect, createClarity);

router.route('/:id')
  .get(getClarityById)
  .put(protect, updateClarity)
  .delete(protect, deleteClarity);

export default router;
