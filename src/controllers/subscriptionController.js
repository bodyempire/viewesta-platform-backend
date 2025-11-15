import Subscription from '../models/Subscription.js';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import paymentService from '../services/paymentService.js';
import { v4 as uuidv4 } from 'uuid';

const SUBSCRIPTION_PRICES = {
  monthly: 9.99,
  yearly: 99.99
};

export const getSubscriptionPlans = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        plans: [
          {
            type: 'monthly',
            name: 'Monthly Subscription',
            price: SUBSCRIPTION_PRICES.monthly,
            currency: 'USD',
            duration_days: 30,
            features: ['Unlimited movie access', 'All quality options', 'Ad-free experience']
          },
          {
            type: 'yearly',
            name: 'Yearly Subscription',
            price: SUBSCRIPTION_PRICES.yearly,
            currency: 'USD',
            duration_days: 365,
            features: ['Unlimited movie access', 'All quality options', 'Ad-free experience', 'Save 17%']
          }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const subscribe = async (req, res, next) => {
  try {
    const { plan_type, payment_method, payment_provider } = req.body;

    if (!plan_type || !['monthly', 'yearly'].includes(plan_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan type. Must be "monthly" or "yearly"'
      });
    }

    const price = SUBSCRIPTION_PRICES[plan_type];

    // Check if user already has active subscription
    const activeSubscription = await Subscription.findActiveByUserId(req.user.id);
    if (activeSubscription) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active subscription',
        data: { subscription: activeSubscription }
      });
    }

    // Handle wallet payment
    if (payment_method === 'wallet') {
      try {
        await Wallet.deductFunds(req.user.id, price);

        // Create completed transaction
        const transaction = await Transaction.create({
          user_id: req.user.id,
          transaction_type: 'subscription',
          amount: price,
          currency: 'USD',
          payment_method: 'wallet',
          payment_provider: 'manual',
          status: 'completed',
          description: `${plan_type} subscription`,
          metadata: { plan_type }
        });

        // Create subscription
        const startDate = new Date();
        const endDate = Subscription.calculateEndDate(plan_type, startDate);

        const subscription = await Subscription.create({
          user_id: req.user.id,
          plan_type,
          price,
          start_date: startDate,
          end_date: endDate,
          auto_renew: true
        });

        return res.status(201).json({
          success: true,
          message: 'Subscription activated successfully',
          data: {
            subscription: {
              id: subscription.id,
              plan_type: subscription.plan_type,
              price: subscription.price,
              start_date: subscription.start_date,
              end_date: subscription.end_date,
              is_active: subscription.is_active
            },
            transaction: {
              id: transaction.id,
              amount: transaction.amount,
              status: transaction.status
            }
          }
        });
      } catch (error) {
        if (error.message === 'Insufficient wallet balance') {
          return res.status(400).json({
            success: false,
            error: 'Insufficient wallet balance'
          });
        }
        throw error;
      }
    }

    // Handle external payment
    const tx_ref = `sub_${Date.now()}_${uuidv4()}`;

    // Create pending transaction
    const transaction = await Transaction.create({
      user_id: req.user.id,
      transaction_type: 'subscription',
      amount: price,
      currency: 'USD',
      payment_method: payment_method || 'card',
      payment_provider: payment_provider || 'flutterwave',
      provider_transaction_id: tx_ref,
      status: 'pending',
      description: `${plan_type} subscription`,
      metadata: { plan_type, tx_ref }
    });

    // Initialize payment
    const paymentInit = await paymentService.initializePayment({
      amount: price,
      email: req.user.email,
      name: `${req.user.first_name} ${req.user.last_name}`,
      currency: 'USD',
      tx_ref,
      payment_provider: payment_provider || 'flutterwave',
      payment_method: payment_method || 'card',
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/subscription/callback`,
      metadata: {
        transaction_id: transaction.id,
        plan_type,
        user_id: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Subscription payment initialized',
      data: {
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          status: transaction.status
        },
        payment: paymentInit
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMySubscription = async (req, res, next) => {
  try {
    const activeSubscription = await Subscription.findActiveByUserId(req.user.id);
    const allSubscriptions = await Subscription.findByUserId(req.user.id);

    res.json({
      success: true,
      data: {
        active_subscription: activeSubscription ? {
          id: activeSubscription.id,
          plan_type: activeSubscription.plan_type,
          price: parseFloat(activeSubscription.price),
          start_date: activeSubscription.start_date,
          end_date: activeSubscription.end_date,
          is_active: activeSubscription.is_active,
          auto_renew: activeSubscription.auto_renew
        } : null,
        subscription_history: allSubscriptions.map(sub => ({
          id: sub.id,
          plan_type: sub.plan_type,
          price: parseFloat(sub.price),
          start_date: sub.start_date,
          end_date: sub.end_date,
          is_active: sub.is_active,
          auto_renew: sub.auto_renew,
          created_at: sub.created_at
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const { subscription_id } = req.params;

    const subscription = await Subscription.findById(subscription_id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    if (subscription.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to cancel this subscription'
      });
    }

    const cancelled = await Subscription.cancel(subscription_id);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: {
        subscription: {
          id: cancelled.id,
          is_active: cancelled.is_active,
          auto_renew: cancelled.auto_renew
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAutoRenew = async (req, res, next) => {
  try {
    const { subscription_id } = req.params;
    const { auto_renew } = req.body;

    if (typeof auto_renew !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'auto_renew must be a boolean value'
      });
    }

    const subscription = await Subscription.findById(subscription_id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    if (subscription.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this subscription'
      });
    }

    const updated = await Subscription.updateAutoRenew(subscription_id, auto_renew);

    res.json({
      success: true,
      message: `Auto-renew ${auto_renew ? 'enabled' : 'disabled'}`,
      data: {
        subscription: {
          id: updated.id,
          auto_renew: updated.auto_renew
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

