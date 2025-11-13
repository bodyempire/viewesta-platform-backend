import express from 'express';
import {
  getMovieReviews,
  createReview,
  getMyReview,
  deleteReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, reviewValidation } from '../utils/validation.js';

const router = express.Router({ mergeParams: true });

router.get('/', getMovieReviews);
router.post('/', protect, validate(reviewValidation), createReview);
router.get('/my-review', protect, getMyReview);
router.delete('/:reviewId', protect, deleteReview);

export default router;

