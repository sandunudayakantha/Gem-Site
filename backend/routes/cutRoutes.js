import express from 'express';
import { getAllCuts, getCutById, createCut, updateCut, deleteCut } from '../controllers/cutController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllCuts)
  .post(protect, createCut);

router.route('/:id')
  .get(getCutById)
  .put(protect, updateCut)
  .delete(protect, deleteCut);

export default router;
