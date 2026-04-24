import express from 'express';
import { getAllCertifications, getCertificationById, createCertification, updateCertification, deleteCertification } from '../controllers/certificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllCertifications)
  .post(protect, upload.single('image'), createCertification);

router.route('/:id')
  .get(getCertificationById)
  .put(protect, upload.single('image'), updateCertification)
  .delete(protect, deleteCertification);

export default router;
