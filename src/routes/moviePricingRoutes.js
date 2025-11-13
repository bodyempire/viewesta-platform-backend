import express from 'express';
import {
  getMoviePricing,
  setPricing,
  updatePricing,
  deletePricing
} from '../controllers/moviePricingController.js';
import { protect } from '../middleware/authMiddleware.js';
import Joi from 'joi';
import { validate } from '../utils/validation.js';

const router = express.Router({ mergeParams: true });

const pricingValidation = {
  set: Joi.object({
    quality: Joi.string().valid('480p', '720p', '1080p', '4K').required(),
    price: Joi.number().min(0).optional(),
    is_free: Joi.boolean().optional()
  }),
  update: Joi.object({
    price: Joi.number().min(0).optional(),
    is_free: Joi.boolean().optional()
  })
};

router.get('/', getMoviePricing);
router.post('/', protect, validate(pricingValidation.set), setPricing);
router.put('/:quality', protect, validate(pricingValidation.update), updatePricing);
router.delete('/:quality', protect, deletePricing);

export default router;

