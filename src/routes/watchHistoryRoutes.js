import express from 'express';
import {
  getWatchHistory,
  getContinueWatching,
  updateProgress,
  deleteHistory
} from '../controllers/watchHistoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { progressValidation, validate } from '../utils/validation.js';

const router = express.Router();

router.use(protect);
router.get('/', getWatchHistory);
router.get('/continue-watching', getContinueWatching);
router.put('/:movieId', validate(progressValidation), updateProgress);
router.delete('/:movieId', deleteHistory);

export default router;

