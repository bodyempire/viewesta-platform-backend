import { query } from '../config/database.js';

class WatchHistory {
  static async updateHistory(userId, movieId, watchTimeSeconds, lastPositionSeconds, isCompleted) {
    const result = await query(
      `INSERT INTO watch_history (user_id, movie_id, watch_time_seconds, last_position_seconds, is_completed, last_watched_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, movie_id)
       DO UPDATE SET watch_time_seconds = $3, last_position_seconds = $4, is_completed = $5,
                     last_watched_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       RETURNING id, user_id, movie_id, watch_time_seconds, last_position_seconds, is_completed, last_watched_at, created_at, updated_at`,
      [userId, movieId, watchTimeSeconds, lastPositionSeconds, isCompleted]
    );
    return result.rows[0];
  }

  static async getByUserId(userId, limit, offset) {
    const result = await query(
      `SELECT wh.*, m.title, m.poster_url, m.duration_minutes, m.release_date
       FROM watch_history wh
       JOIN movies m ON wh.movie_id = m.id
       WHERE wh.user_id = $1
       ORDER BY wh.last_watched_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async getContinueWatching(userId, limit) {
    const result = await query(
      `SELECT wh.*, m.title, m.poster_url, m.duration_minutes, m.description
       FROM watch_history wh
       JOIN movies m ON wh.movie_id = m.id
       WHERE wh.user_id = $1 AND wh.is_completed = FALSE
       ORDER BY wh.last_watched_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async delete(userId, movieId) {
    const result = await query(
      'DELETE FROM watch_history WHERE user_id = $1 AND movie_id = $2 RETURNING id, movie_id',
      [userId, movieId]
    );
    return result.rows[0] || null;
  }
}

export default WatchHistory;

