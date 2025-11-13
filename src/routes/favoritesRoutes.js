import express from 'express';
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite
} from '../controllers/favoritesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getFavorites);
router.post('/:movieId', addToFavorites);
router.delete('/:movieId', removeFromFavorites);
router.get('/:movieId/check', checkFavorite);

export default router;

