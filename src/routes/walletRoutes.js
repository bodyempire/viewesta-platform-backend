import express from 'express';
import {
  getWallet,
  topUpWallet,
  getTransactionHistory,
  updateWalletCurrency
} from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../utils/validation.js';
import Joi from 'joi';

const router = express.Router();

const walletValidation = {
  topUp: Joi.object({
    amount: Joi.number().positive().required(),
    payment_provider: Joi.string().valid('flutterwave', 'stripe').optional(),
    payment_method: Joi.string().valid('card', 'mobile_money', 'wallet').optional()
  }),
  updateCurrency: Joi.object({
    currency: Joi.string().valid('USD', 'UGX', 'KES', 'NGN', 'ZAR', 'GHS').required()
  })
};

// All routes require authentication
router.use(protect);

router.get('/', getWallet);
router.post('/topup', validate(walletValidation.topUp), topUpWallet);
router.get('/transactions', getTransactionHistory);
router.put('/currency', validate(walletValidation.updateCurrency), updateWalletCurrency);

export default router;

