import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import MoviePurchase from '../models/MoviePurchase.js';
import Movie from '../models/Movie.js';
import MoviePricing from '../models/MoviePricing.js';
import paymentService from '../services/paymentService.js';
import { v4 as uuidv4 } from 'uuid';

export const purchaseMovie = async (req, res, next) => {
  try {
    const { movie_id, quality, payment_method, payment_provider } = req.body;

    // Get movie and pricing
    const movie = await Movie.findById(movie_id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    const pricing = await MoviePricing.findByMovieAndQuality(movie_id, quality);
    if (!pricing) {
      return res.status(404).json({
        success: false,
        error: `Pricing for ${quality} quality not found for this movie`
      });
    }

    if (pricing.is_free) {
      // Free movie - grant access immediately
      const purchase = await MoviePurchase.create({
        user_id: req.user.id,
        movie_id,
        transaction_id: null,
        quality,
        price_paid: 0,
        access_expires_at: MoviePurchase.calculateExpiryDate(365) // Free movies: 1 year access
      });

      return res.status(201).json({
        success: true,
        message: 'Free movie access granted',
        data: {
          purchase: {
            id: purchase.id,
            movie_id: purchase.movie_id,
            quality: purchase.quality,
            access_expires_at: purchase.access_expires_at
          }
        }
      });
    }

    const price = parseFloat(pricing.price);

    // Check if user already has active purchase
    const existingPurchase = await MoviePurchase.findActivePurchase(
      req.user.id,
      movie_id,
      quality
    );
    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        error: 'You already have active access to this movie quality'
      });
    }

    // Handle wallet payment
    if (payment_method === 'wallet') {
      try {
        await Wallet.deductFunds(req.user.id, price);

        // Create completed transaction
        const transaction = await Transaction.create({
          user_id: req.user.id,
          transaction_type: 'purchase',
          amount: price,
          currency: 'USD',
          payment_method: 'wallet',
          payment_provider: 'manual',
          status: 'completed',
          description: `Movie purchase: ${movie.title} (${quality})`,
          metadata: { movie_id, quality }
        });

        // Create purchase record
        const purchase = await MoviePurchase.create({
          user_id: req.user.id,
          movie_id,
          transaction_id: transaction.id,
          quality,
          price_paid: price,
          access_expires_at: MoviePurchase.calculateExpiryDate(7) // 7 days access
        });

        return res.status(201).json({
          success: true,
          message: 'Movie purchased successfully',
          data: {
            purchase: {
              id: purchase.id,
              movie_id: purchase.movie_id,
              quality: purchase.quality,
              price_paid: purchase.price_paid,
              access_expires_at: purchase.access_expires_at
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

    // Handle external payment (Flutterwave/Stripe)
    const tx_ref = `viewesta_${Date.now()}_${uuidv4()}`;

    // Create pending transaction
    const transaction = await Transaction.create({
      user_id: req.user.id,
      transaction_type: 'purchase',
      amount: price,
      currency: 'USD',
      payment_method: payment_method || 'card',
      payment_provider: payment_provider || 'flutterwave',
      provider_transaction_id: tx_ref,
      status: 'pending',
      description: `Movie purchase: ${movie.title} (${quality})`,
      metadata: { movie_id, quality, tx_ref }
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
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/callback`,
      metadata: {
        transaction_id: transaction.id,
        movie_id,
        quality,
        user_id: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment initialized',
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

export const verifyPayment = async (req, res, next) => {
  try {
    const { transaction_id, provider_transaction_id, payment_provider } = req.body;

    if (!transaction_id && !provider_transaction_id) {
      return res.status(400).json({
        success: false,
        error: 'Either transaction_id or provider_transaction_id is required'
      });
    }

    let transaction;
    if (transaction_id) {
      transaction = await Transaction.findById(transaction_id);
    } else {
      transaction = await Transaction.findByProviderId(provider_transaction_id);
    }

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction.status === 'completed') {
      return res.json({
        success: true,
        message: 'Transaction already completed',
        data: { transaction }
      });
    }

    // Verify with payment provider
    const verification = await paymentService.verifyPayment(
      payment_provider || transaction.payment_provider,
      provider_transaction_id || transaction.provider_transaction_id
    );

    if (verification.status === 'success' || verification.status === 'succeeded') {
      // Update transaction status
      await Transaction.updateStatus(transaction.id, 'completed', {
        verified_at: new Date().toISOString(),
        provider_response: verification
      });

      // Handle based on transaction type
      if (transaction.transaction_type === 'wallet_topup') {
        await Wallet.addFunds(transaction.user_id, parseFloat(transaction.amount));
      } else if (transaction.transaction_type === 'purchase') {
        // PostgreSQL JSONB is already parsed by pg library
        const metadata = transaction.metadata || {};
        if (metadata.movie_id && metadata.quality) {
          const purchase = await MoviePurchase.create({
            user_id: transaction.user_id,
            movie_id: metadata.movie_id,
            transaction_id: transaction.id,
            quality: metadata.quality,
            price_paid: parseFloat(transaction.amount),
            access_expires_at: MoviePurchase.calculateExpiryDate(7)
          });
        }
      }

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        data: { transaction: await Transaction.findById(transaction.id) }
      });
    } else {
      await Transaction.updateStatus(transaction.id, 'failed', {
        verification_response: verification
      });

      return res.status(400).json({
        success: false,
        error: 'Payment verification failed',
        data: { transaction: await Transaction.findById(transaction.id) }
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getMyPurchases = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const purchases = await MoviePurchase.findByUserId(req.user.id, limit, offset);

    res.json({
      success: true,
      data: {
        purchases: purchases.map(p => ({
          id: p.id,
          movie_id: p.movie_id,
          movie_title: p.title,
          poster_url: p.poster_url,
          quality: p.quality,
          price_paid: parseFloat(p.price_paid),
          access_expires_at: p.access_expires_at,
          is_active: p.is_active && new Date(p.access_expires_at) > new Date(),
          created_at: p.created_at
        })),
        pagination: {
          limit,
          offset,
          count: purchases.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

