import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate, categoryValidation } from '../utils/validation.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', protect, authorize('admin'), validate(categoryValidation.create), createCategory);
router.put('/:id', protect, authorize('admin'), validate(categoryValidation.update), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;

