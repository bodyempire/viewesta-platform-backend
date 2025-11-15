import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import MoviePurchase from '../models/MoviePurchase.js';
import Subscription from '../models/Subscription.js';
import paymentService from '../services/paymentService.js';

export const flutterwaveWebhook = async (req, res, next) => {
  try {
    // Parse JSON from raw body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { event, data } = body;

    if (event === 'charge.completed' && data.status === 'successful') {
      const { tx_ref, id: transactionId } = data;

      // Find transaction by provider transaction ID
      const transaction = await Transaction.findByProviderId(tx_ref || transactionId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
      }

      if (transaction.status === 'completed') {
        return res.json({ success: true, message: 'Transaction already processed' });
      }

      // Update transaction status
      await Transaction.updateStatus(transaction.id, 'completed', {
        verified_at: new Date().toISOString(),
        provider_response: data
      });

      // Handle based on transaction type
      if (transaction.transaction_type === 'wallet_topup') {
        await Wallet.addFunds(transaction.user_id, parseFloat(transaction.amount));
      } else if (transaction.transaction_type === 'purchase') {
        // PostgreSQL JSONB is already parsed by pg library
        const metadata = transaction.metadata || {};
        if (metadata.movie_id && metadata.quality) {
          await MoviePurchase.create({
            user_id: transaction.user_id,
            movie_id: metadata.movie_id,
            transaction_id: transaction.id,
            quality: metadata.quality,
            price_paid: parseFloat(transaction.amount),
            access_expires_at: MoviePurchase.calculateExpiryDate(7)
          });
        }
      } else if (transaction.transaction_type === 'subscription') {
        // PostgreSQL JSONB is already parsed by pg library
        const metadata = transaction.metadata || {};
        if (metadata.plan_type) {
          const startDate = new Date();
          const endDate = Subscription.calculateEndDate(metadata.plan_type, startDate);

          await Subscription.create({
            user_id: transaction.user_id,
            plan_type: metadata.plan_type,
            price: parseFloat(transaction.amount),
            start_date: startDate,
            end_date: endDate,
            auto_renew: true
          });
        }
      }

      return res.json({ success: true, message: 'Webhook processed successfully' });
    }

    res.json({ success: true, message: 'Webhook received but no action needed' });
  } catch (error) {
    next(error);
  }
};

export const stripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    // Stripe webhook needs raw body buffer for signature verification
    const payload = req.body;

    // Verify webhook signature
    const event = await paymentService.verifyStripeWebhook(payload, signature);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { metadata } = paymentIntent;

      // Find transaction
      const transaction = await Transaction.findByProviderId(paymentIntent.id);

      if (!transaction && metadata?.transaction_id) {
        const found = await Transaction.findById(metadata.transaction_id);
        if (found) {
          await Transaction.updateStatus(found.id, 'completed', {
            verified_at: new Date().toISOString(),
            provider_response: paymentIntent
          });

          // Handle based on transaction type
          if (found.transaction_type === 'wallet_topup') {
            await Wallet.addFunds(found.user_id, parseFloat(found.amount));
          } else if (found.transaction_type === 'purchase') {
            // PostgreSQL JSONB is already parsed by pg library
            const txMetadata = found.metadata || {};
            if (txMetadata.movie_id && txMetadata.quality) {
              await MoviePurchase.create({
                user_id: found.user_id,
                movie_id: txMetadata.movie_id,
                transaction_id: found.id,
                quality: txMetadata.quality,
                price_paid: parseFloat(found.amount),
                access_expires_at: MoviePurchase.calculateExpiryDate(7)
              });
            }
          } else if (found.transaction_type === 'subscription') {
            // PostgreSQL JSONB is already parsed by pg library
            const txMetadata = found.metadata || {};
            if (txMetadata.plan_type) {
              const startDate = new Date();
              const endDate = Subscription.calculateEndDate(txMetadata.plan_type, startDate);

              await Subscription.create({
                user_id: found.user_id,
                plan_type: txMetadata.plan_type,
                price: parseFloat(found.amount),
                start_date: startDate,
                end_date: endDate,
                auto_renew: true
              });
            }
          }
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

