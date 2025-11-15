import { query } from '../config/database.js';

class Wallet {
  static async findByUserId(userId) {
    const result = await query(
      'SELECT * FROM user_wallets WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  static async create(userId, currency = 'USD') {
    const result = await query(
      `INSERT INTO user_wallets (user_id, balance, currency)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING *`,
      [userId, 0.0, currency]
    );
    return result.rows[0] || await this.findByUserId(userId);
  }

  static async getBalance(userId) {
    const wallet = await this.findByUserId(userId);
    if (!wallet) {
      const newWallet = await this.create(userId);
      return newWallet.balance;
    }
    return parseFloat(wallet.balance);
  }

  static async addFunds(userId, amount) {
    const wallet = await this.findByUserId(userId);
    if (!wallet) {
      await this.create(userId);
    }

    const result = await query(
      `UPDATE user_wallets
       SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [amount, userId]
    );
    return result.rows[0];
  }

  static async deductFunds(userId, amount) {
    const wallet = await this.findByUserId(userId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const currentBalance = parseFloat(wallet.balance);
    if (currentBalance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const result = await query(
      `UPDATE user_wallets
       SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [amount, userId]
    );
    return result.rows[0];
  }

  static async updateCurrency(userId, currency) {
    const result = await query(
      `UPDATE user_wallets
       SET currency = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [currency, userId]
    );
    return result.rows[0];
  }
}

export default Wallet;

