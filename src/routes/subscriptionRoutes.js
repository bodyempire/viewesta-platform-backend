import express from 'express';
import {
  getSubscriptionPlans,
  subscribe,
  getMySubscription,
  cancelSubscription,
  updateAutoRenew
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../utils/validation.js';
import Joi from 'joi';

const router = express.Router();

const subscriptionValidation = {
  subscribe: Joi.object({
    plan_type: Joi.string().valid('monthly', 'yearly').required(),
    payment_method: Joi.string().valid('card', 'mobile_money', 'wallet').optional(),
    payment_provider: Joi.string().valid('flutterwave', 'stripe').optional()
  }),
  updateAutoRenew: Joi.object({
    auto_renew: Joi.boolean().required()
  })
};

// Public route
router.get('/plans', getSubscriptionPlans);

// Protected routes
router.use(protect);
router.post('/subscribe', validate(subscriptionValidation.subscribe), subscribe);
router.get('/me', getMySubscription);
router.put('/:subscription_id/cancel', cancelSubscription);
router.put('/:subscription_id/auto-renew', validate(subscriptionValidation.updateAutoRenew), updateAutoRenew);

export default router;

