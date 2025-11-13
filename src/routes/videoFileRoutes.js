import express from 'express';
import {
  getMovieVideoFiles,
  addVideoFile,
  updateVideoFile,
  deleteVideoFile
} from '../controllers/videoFileController.js';
import { protect } from '../middleware/authMiddleware.js';
import Joi from 'joi';
import { validate } from '../utils/validation.js';

const router = express.Router({ mergeParams: true });

const videoFileValidation = {
  create: Joi.object({
    quality: Joi.string().valid('480p', '720p', '1080p', '4K').required(),
    file_url: Joi.string().uri().required(),
    file_size: Joi.number().integer().min(0).optional(),
    duration_seconds: Joi.number().integer().min(0).optional(),
    s3_key: Joi.string().optional()
  }),
  update: Joi.object({
    file_url: Joi.string().uri().optional(),
    file_size: Joi.number().integer().min(0).optional(),
    duration_seconds: Joi.number().integer().min(0).optional(),
    s3_key: Joi.string().optional(),
    is_processed: Joi.boolean().optional()
  })
};

router.get('/', getMovieVideoFiles);
router.post('/', protect, validate(videoFileValidation.create), addVideoFile);
router.put('/:fileId', protect, validate(videoFileValidation.update), updateVideoFile);
router.delete('/:fileId', protect, deleteVideoFile);

export default router;

