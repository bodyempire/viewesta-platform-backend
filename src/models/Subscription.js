import { query } from '../config/database.js';

class Subscription {
  static async create(subscriptionData) {
    const {
      user_id,
      plan_type,
      price,
      start_date,
      end_date,
      auto_renew = true
    } = subscriptionData;

    // Deactivate any existing active subscriptions
    await query(
      `UPDATE subscriptions
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_active = true`,
      [user_id]
    );

    const result = await query(
      `INSERT INTO subscriptions (
        user_id, plan_type, price, start_date, end_date, auto_renew, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *`,
      [user_id, plan_type, price, start_date, end_date, auto_renew]
    );
    return result.rows[0];
  }

  static async findActiveByUserId(userId) {
    const result = await query(
      `SELECT * FROM subscriptions
       WHERE user_id = $1 AND is_active = true
       AND end_date > CURRENT_TIMESTAMP
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId) {
    const result = await query(
      `SELECT * FROM subscriptions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM subscriptions WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async cancel(id) {
    const result = await query(
      `UPDATE subscriptions
       SET is_active = false, auto_renew = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async updateAutoRenew(id, autoRenew) {
    const result = await query(
      `UPDATE subscriptions
       SET auto_renew = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [autoRenew, id]
    );
    return result.rows[0];
  }

  static async expireOldSubscriptions() {
    const result = await query(
      `UPDATE subscriptions
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE is_active = true AND end_date < CURRENT_TIMESTAMP
       RETURNING *`
    );
    return result.rows;
  }

  static calculateEndDate(planType, startDate = new Date()) {
    const start = new Date(startDate);
    const end = new Date(start);

    if (planType === 'monthly') {
      end.setMonth(end.getMonth() + 1);
    } else if (planType === 'yearly') {
      end.setFullYear(end.getFullYear() + 1);
    }

    return end;
  }
}

export default Subscription;

