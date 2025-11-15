import express from 'express';
import {
  purchaseMovie,
  verifyPayment,
  getMyPurchases
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../utils/validation.js';
import Joi from 'joi';

const router = express.Router();

const paymentValidation = {
  purchase: Joi.object({
    movie_id: Joi.string().uuid().required(),
    quality: Joi.string().valid('480p', '720p', '1080p', '4K').required(),
    payment_method: Joi.string().valid('card', 'mobile_money', 'wallet').optional(),
    payment_provider: Joi.string().valid('flutterwave', 'stripe').optional()
  }),
  verify: Joi.object({
    transaction_id: Joi.string().uuid().optional(),
    provider_transaction_id: Joi.string().optional(),
    payment_provider: Joi.string().valid('flutterwave', 'stripe').optional()
  }).or('transaction_id', 'provider_transaction_id')
};

// All routes require authentication
router.use(protect);

router.post('/purchase', validate(paymentValidation.purchase), purchaseMovie);
router.post('/verify', validate(paymentValidation.verify), verifyPayment);
router.get('/purchases', getMyPurchases);

export default router;

