import { query } from '../config/database.js';

class MoviePurchase {
  static async create(purchaseData) {
    const {
      user_id,
      movie_id,
      transaction_id,
      quality,
      price_paid,
      access_expires_at
    } = purchaseData;

    const result = await query(
      `INSERT INTO movie_purchases (
        user_id, movie_id, transaction_id, quality, price_paid, access_expires_at, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, true)
      ON CONFLICT DO NOTHING
      RETURNING *`,
      [user_id, movie_id, transaction_id, quality, price_paid, access_expires_at]
    );
    return result.rows[0];
  }

  static async findActivePurchase(userId, movieId, quality) {
    const result = await query(
      `SELECT * FROM movie_purchases
       WHERE user_id = $1 AND movie_id = $2 AND quality = $3
       AND is_active = true AND access_expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, movieId, quality]
    );
    return result.rows[0] || null;
  }

  static async findAnyActivePurchase(userId, movieId) {
    const result = await query(
      `SELECT * FROM movie_purchases
       WHERE user_id = $1 AND movie_id = $2
       AND is_active = true AND access_expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, movieId]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId, limit = 50, offset = 0) {
    const result = await query(
      `SELECT mp.*, m.title, m.poster_url
       FROM movie_purchases mp
       JOIN movies m ON mp.movie_id = m.id
       WHERE mp.user_id = $1
       ORDER BY mp.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async expireOldPurchases() {
    const result = await query(
      `UPDATE movie_purchases
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE is_active = true AND access_expires_at < CURRENT_TIMESTAMP
       RETURNING *`
    );
    return result.rows;
  }

  static calculateExpiryDate(days = 7) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
  }
}

export default MoviePurchase;

