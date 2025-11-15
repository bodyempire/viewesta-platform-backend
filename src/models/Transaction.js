import { query } from '../config/database.js';

class Transaction {
  static async create(transactionData) {
    const {
      user_id,
      transaction_type,
      amount,
      currency = 'USD',
      payment_method,
      payment_provider,
      provider_transaction_id,
      status = 'pending',
      description,
      metadata
    } = transactionData;

    const result = await query(
      `INSERT INTO transactions (
        user_id, transaction_type, amount, currency, payment_method,
        payment_provider, provider_transaction_id, status, description, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        user_id,
        transaction_type,
        amount,
        currency,
        payment_method,
        payment_provider,
        provider_transaction_id,
        status,
        description,
        metadata ? JSON.stringify(metadata) : null
      ]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM transactions WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByProviderId(providerTransactionId) {
    const result = await query(
      'SELECT * FROM transactions WHERE provider_transaction_id = $1',
      [providerTransactionId]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId, limit = 50, offset = 0) {
    const result = await query(
      `SELECT * FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async updateStatus(id, status, metadata = null) {
    const updates = ['status = $2', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [id, status];

    if (metadata) {
      updates.push('metadata = $3');
      values.push(JSON.stringify(metadata));
    }

    const result = await query(
      `UPDATE transactions
       SET ${updates.join(', ')}
       WHERE id = $1
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async getTotalByType(userId, transactionType) {
    const result = await query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE user_id = $1 AND transaction_type = $2 AND status = 'completed'`,
      [userId, transactionType]
    );
    return parseFloat(result.rows[0].total);
  }
}

export default Transaction;

