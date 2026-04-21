import express from 'express';
import { getAllOrigins, getOriginById, createOrigin, updateOrigin, deleteOrigin } from '../controllers/originController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllOrigins)
  .post(protect, createOrigin);

router.route('/:id')
  .get(getOriginById)
  .put(protect, updateOrigin)
  .delete(protect, deleteOrigin);

export default router;
