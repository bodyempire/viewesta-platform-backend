import { query } from '../config/database.js';

class MoviePricing {
  static async setPricing(movieId, quality, price, isFree = false) {
    const result = await query(
      `INSERT INTO movie_pricing (movie_id, quality, price, is_free)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (movie_id, quality)
       DO UPDATE SET price = $3, is_free = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING id, movie_id, quality, price, is_free, created_at, updated_at`,
      [movieId, quality, price, isFree]
    );
    return result.rows[0];
  }

  static async getByMovieId(movieId) {
    const result = await query(
      `SELECT * FROM movie_pricing WHERE movie_id = $1
       ORDER BY CASE quality
         WHEN '4K' THEN 1
         WHEN '1080p' THEN 2
         WHEN '720p' THEN 3
         WHEN '480p' THEN 4
       END`,
      [movieId]
    );
    return result.rows;
  }

  static async getPrice(movieId, quality) {
    const result = await query(
      'SELECT * FROM movie_pricing WHERE movie_id = $1 AND quality = $2',
      [movieId, quality]
    );
    return result.rows[0] || null;
  }

  static async findByMovieAndQuality(movieId, quality) {
    return await this.getPrice(movieId, quality);
  }

  static async update(movieId, quality, data) {
    const result = await query(
      `UPDATE movie_pricing SET price = $1, is_free = $2, updated_at = CURRENT_TIMESTAMP
       WHERE movie_id = $3 AND quality = $4
       RETURNING id, movie_id, quality, price, is_free, created_at, updated_at`,
      [data.price, data.is_free, movieId, quality]
    );
    return result.rows[0] || null;
  }

  static async delete(movieId, quality) {
    const result = await query(
      'DELETE FROM movie_pricing WHERE movie_id = $1 AND quality = $2 RETURNING id, movie_id, quality',
      [movieId, quality]
    );
    return result.rows[0] || null;
  }
}

export default MoviePricing;

