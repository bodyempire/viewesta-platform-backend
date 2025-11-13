import express from 'express';
import {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  getFeaturedMovies,
  getTrendingMovies
} from '../controllers/movieController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, validateQuery, movieValidation } from '../utils/validation.js';
import moviePricingRoutes from './moviePricingRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import videoFileRoutes from './videoFileRoutes.js';

const router = express.Router();

router.get('/', validateQuery(movieValidation.query), getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/trending', getTrendingMovies);
router.get('/:id', getMovie);
router.post('/', protect, validate(movieValidation.create), createMovie);
router.put('/:id', protect, validate(movieValidation.update), updateMovie);
router.delete('/:id', protect, deleteMovie);

router.use('/:movieId/pricing', moviePricingRoutes);
router.use('/:movieId/reviews', reviewRoutes);
router.use('/:movieId/video-files', videoFileRoutes);

export default router;

