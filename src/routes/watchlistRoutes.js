import express from 'express';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  checkWatchlist
} from '../controllers/watchlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getWatchlist);
router.post('/:movieId', addToWatchlist);
router.delete('/:movieId', removeFromWatchlist);
router.get('/:movieId/check', checkWatchlist);

export default router;

