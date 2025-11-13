import { query } from '../config/database.js';

class VideoFile {
  static async create(movieId, quality, fileUrl, fileSize, durationSeconds, s3Key) {
    const result = await query(
      `INSERT INTO movie_video_files (movie_id, quality, file_url, file_size, duration_seconds, s3_key)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, movie_id, quality, file_url, file_size, duration_seconds, s3_key, is_processed, created_at, updated_at`,
      [movieId, quality, fileUrl, fileSize || null, durationSeconds || null, s3Key || null]
    );
    return result.rows[0];
  }

  static async getByMovieId(movieId) {
    const result = await query(
      `SELECT * FROM movie_video_files WHERE movie_id = $1
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

  static async findById(id) {
    const result = await query('SELECT * FROM movie_video_files WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let param = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        const column = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${column} = $${param}`);
        values.push(value);
        param++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await query(
      `UPDATE movie_video_files SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${param}
       RETURNING id, movie_id, quality, file_url, file_size, duration_seconds, s3_key, is_processed, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await query('DELETE FROM movie_video_files WHERE id = $1 RETURNING id, movie_id, quality, s3_key', [id]);
    return result.rows[0] || null;
  }
}

export default VideoFile;

