import { query } from '../config/database.js';

class MovieReview {
  static async createOrUpdate(userId, movieId, rating, reviewText) {
    const result = await query(
      `INSERT INTO movie_reviews (user_id, movie_id, rating, review_text)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, movie_id)
       DO UPDATE SET rating = $3, review_text = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING id, user_id, movie_id, rating, review_text, is_approved, helpful_count, created_at, updated_at`,
      [userId, movieId, rating, reviewText || null]
    );
    return result.rows[0];
  }

  static async getByMovieId(movieId, limit, offset, approvedOnly) {
    let text = `SELECT mr.*, u.first_name, u.last_name, u.avatar_url
                FROM movie_reviews mr
                JOIN users u ON mr.user_id = u.id
                WHERE mr.movie_id = $1`;
    const values = [movieId];
    if (approvedOnly) {
      text += ' AND mr.is_approved = TRUE';
    }
    text += ' ORDER BY mr.created_at DESC LIMIT $2 OFFSET $3';
    values.push(limit, offset);
    const result = await query(text, values);
    return result.rows;
  }

  static async getByUserAndMovie(userId, movieId) {
    const result = await query(
      'SELECT * FROM movie_reviews WHERE user_id = $1 AND movie_id = $2',
      [userId, movieId]
    );
    return result.rows[0] || null;
  }

  static async delete(reviewId, userId) {
    const result = await query(
      'DELETE FROM movie_reviews WHERE id = $1 AND user_id = $2 RETURNING id, movie_id',
      [reviewId, userId]
    );
    return result.rows[0] || null;
  }

  static async getMovieStats(movieId) {
    const result = await query(
      `SELECT COUNT(*) AS total_reviews,
              AVG(rating)::NUMERIC(3,2) AS average_rating,
              COUNT(CASE WHEN rating = 5 THEN 1 END) AS five_star,
              COUNT(CASE WHEN rating = 4 THEN 1 END) AS four_star,
              COUNT(CASE WHEN rating = 3 THEN 1 END) AS three_star,
              COUNT(CASE WHEN rating = 2 THEN 1 END) AS two_star,
              COUNT(CASE WHEN rating = 1 THEN 1 END) AS one_star
       FROM movie_reviews
       WHERE movie_id = $1 AND is_approved = TRUE`,
      [movieId]
    );
    return result.rows[0] || null;
  }
}

export default MovieReview;

