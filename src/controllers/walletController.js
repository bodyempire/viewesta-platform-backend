import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';

export const getWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findByUserId(req.user.id);
    
    if (!wallet) {
      const newWallet = await Wallet.create(req.user.id);
      return res.json({
        success: true,
        data: {
          wallet: {
            balance: parseFloat(newWallet.balance),
            currency: newWallet.currency,
            user_id: newWallet.user_id
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        wallet: {
          balance: parseFloat(wallet.balance),
          currency: wallet.currency,
          user_id: wallet.user_id
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const topUpWallet = async (req, res, next) => {
  try {
    const { amount, payment_provider, payment_method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Amount must be greater than 0'
      });
    }

    // Create pending transaction
    const transaction = await Transaction.create({
      user_id: req.user.id,
      transaction_type: 'wallet_topup',
      amount,
      currency: 'USD',
      payment_method: payment_method || 'card',
      payment_provider: payment_provider || 'flutterwave',
      status: 'pending',
      description: `Wallet top-up of ${amount} ${'USD'}`
    });

    res.status(201).json({
      success: true,
      message: 'Top-up transaction initiated',
      data: {
        transaction: {
          id: transaction.id,
          amount: parseFloat(transaction.amount),
          status: transaction.status,
          payment_provider: transaction.payment_provider
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const transactions = await Transaction.findByUserId(req.user.id, limit, offset);

    res.json({
      success: true,
      data: {
        transactions: transactions.map(tx => ({
          id: tx.id,
          transaction_type: tx.transaction_type,
          amount: parseFloat(tx.amount),
          currency: tx.currency,
          payment_method: tx.payment_method,
          payment_provider: tx.payment_provider,
          status: tx.status,
          description: tx.description,
          created_at: tx.created_at
        })),
        pagination: {
          limit,
          offset,
          count: transactions.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateWalletCurrency = async (req, res, next) => {
  try {
    const { currency } = req.body;

    if (!currency || !['USD', 'UGX', 'KES', 'NGN', 'ZAR', 'GHS'].includes(currency.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid currency. Supported currencies: USD, UGX, KES, NGN, ZAR, GHS'
      });
    }

    const wallet = await Wallet.updateCurrency(req.user.id, currency.toUpperCase());

    res.json({
      success: true,
      message: 'Wallet currency updated',
      data: {
        wallet: {
          balance: parseFloat(wallet.balance),
          currency: wallet.currency,
          user_id: wallet.user_id
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

