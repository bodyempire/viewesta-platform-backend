import { query } from '../config/database.js';

class Watchlist {
  static async add(userId, movieId) {
    const result = await query(
      `INSERT INTO user_watchlists (user_id, movie_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, movie_id) DO NOTHING
       RETURNING id, user_id, movie_id, created_at`,
      [userId, movieId]
    );
    return result.rows[0] || null;
  }

  static async remove(userId, movieId) {
    const result = await query(
      'DELETE FROM user_watchlists WHERE user_id = $1 AND movie_id = $2 RETURNING id, user_id, movie_id',
      [userId, movieId]
    );
    return result.rows[0] || null;
  }

  static async getByUserId(userId, limit, offset) {
    const result = await query(
      `SELECT m.*, c.name AS category_name, c.slug AS category_slug,
              (SELECT AVG(rating)::NUMERIC(3,2) FROM movie_reviews WHERE movie_id = m.id AND is_approved = TRUE) AS average_rating,
              uw.created_at AS added_to_watchlist_at
       FROM user_watchlists uw
       JOIN movies m ON uw.movie_id = m.id
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE uw.user_id = $1
       ORDER BY uw.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async isInWatchlist(userId, movieId) {
    const result = await query(
      'SELECT EXISTS (SELECT 1 FROM user_watchlists WHERE user_id = $1 AND movie_id = $2) AS is_in_watchlist',
      [userId, movieId]
    );
    return result.rows[0].is_in_watchlist;
  }

  static async getCount(userId) {
    const result = await query(
      'SELECT COUNT(*) AS count FROM user_watchlists WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }
}

export default Watchlist;

