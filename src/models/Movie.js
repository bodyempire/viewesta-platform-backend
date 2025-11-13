import { query } from '../config/database.js';

class Movie {
  static async create(data) {
    const {
      title,
      description,
      synopsis,
      poster_url,
      backdrop_url,
      trailer_url,
      release_date,
      duration_minutes,
      filmmaker_id,
      category_id,
      language,
      country,
      status = 'pending'
    } = data;

    const result = await query(
      `INSERT INTO movies (
        title, description, synopsis, poster_url, backdrop_url, trailer_url,
        release_date, duration_minutes, filmmaker_id, category_id, language, country, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, title, description, synopsis, poster_url, backdrop_url, trailer_url,
                release_date, duration_minutes, filmmaker_id, category_id, language, country,
                status, is_featured, created_at, updated_at`,
      [
        title,
        description || null,
        synopsis || null,
        poster_url || null,
        backdrop_url || null,
        trailer_url || null,
        release_date || null,
        duration_minutes || null,
        filmmaker_id || null,
        category_id || null,
        language || null,
        country || null,
        status
      ]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT m.*, u.first_name AS filmmaker_first_name, u.last_name AS filmmaker_last_name, u.email AS filmmaker_email,
              c.name AS category_name, c.slug AS category_slug,
              (SELECT AVG(rating)::NUMERIC(3,2) FROM movie_reviews WHERE movie_id = m.id AND is_approved = TRUE) AS average_rating,
              (SELECT COUNT(*) FROM movie_reviews WHERE movie_id = m.id AND is_approved = TRUE) AS review_count
       FROM movies m
       LEFT JOIN users u ON m.filmmaker_id = u.id
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE m.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findAll(filters = {}) {
    const {
      status,
      category_id,
      filmmaker_id,
      is_featured,
      search,
      limit = 20,
      offset = 0,
      sort_by = 'created_at',
      order = 'DESC'
    } = filters;

    let text = `SELECT m.*, u.first_name AS filmmaker_first_name, u.last_name AS filmmaker_last_name,
                       c.name AS category_name, c.slug AS category_slug,
                       (SELECT AVG(rating)::NUMERIC(3,2) FROM movie_reviews WHERE movie_id = m.id AND is_approved = TRUE) AS average_rating,
                       (SELECT COUNT(*) FROM movie_reviews WHERE movie_id = m.id AND is_approved = TRUE) AS review_count
                FROM movies m
                LEFT JOIN users u ON m.filmmaker_id = u.id
                LEFT JOIN categories c ON m.category_id = c.id
                WHERE 1=1`;

    const values = [];
    let param = 1;

    if (status) {
      text += ` AND m.status = $${param}`;
      values.push(status);
      param++;
    }
    if (category_id) {
      text += ` AND m.category_id = $${param}`;
      values.push(category_id);
      param++;
    }
    if (filmmaker_id) {
      text += ` AND m.filmmaker_id = $${param}`;
      values.push(filmmaker_id);
      param++;
    }
    if (is_featured !== undefined) {
      text += ` AND m.is_featured = $${param}`;
      values.push(is_featured);
      param++;
    }
    if (search) {
      text += ` AND (m.title ILIKE $${param} OR m.description ILIKE $${param})`;
      values.push(`%${search}%`);
      param++;
    }

    const validSort = ['created_at', 'title', 'release_date', 'average_rating'];
    const sortField = validSort.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    text += ` ORDER BY m.${sortField} ${sortOrder} LIMIT $${param} OFFSET $${param + 1}`;
    values.push(limit, offset);

    const result = await query(text, values);
    return result.rows;
  }

  static async count(filters = {}) {
    const { status, category_id, filmmaker_id, is_featured, search } = filters;

    let text = 'SELECT COUNT(*) AS total FROM movies m WHERE 1=1';
    const values = [];
    let param = 1;

    if (status) {
      text += ` AND m.status = $${param}`;
      values.push(status);
      param++;
    }
    if (category_id) {
      text += ` AND m.category_id = $${param}`;
      values.push(category_id);
      param++;
    }
    if (filmmaker_id) {
      text += ` AND m.filmmaker_id = $${param}`;
      values.push(filmmaker_id);
      param++;
    }
    if (is_featured !== undefined) {
      text += ` AND m.is_featured = $${param}`;
      values.push(is_featured);
      param++;
    }
    if (search) {
      text += ` AND (m.title ILIKE $${param} OR m.description ILIKE $${param})`;
      values.push(`%${search}%`);
      param++;
    }

    const result = await query(text, values);
    return parseInt(result.rows[0].total, 10);
  }

  static async update(id, data) {
    const allowed = [
      'title', 'description', 'synopsis', 'poster_url', 'backdrop_url',
      'trailer_url', 'release_date', 'duration_minutes', 'category_id',
      'language', 'country', 'status', 'is_featured'
    ];

    const fields = [];
    const values = [];
    let param = 1;

    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key) && value !== undefined) {
        fields.push(`${key} = $${param}`);
        values.push(value);
        param++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await query(
      `UPDATE movies SET ${fields.join(', ')} WHERE id = $${param}
       RETURNING id, title, description, synopsis, poster_url, backdrop_url, trailer_url,
                 release_date, duration_minutes, filmmaker_id, category_id, language, country,
                 status, is_featured, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await query('DELETE FROM movies WHERE id = $1 RETURNING id, title', [id]);
    return result.rows[0] || null;
  }

  static async getFeatured(limit = 10) {
    const result = await query(
      `SELECT m.*, u.first_name AS filmmaker_first_name, u.last_name AS filmmaker_last_name,
              c.name AS category_name,
              (SELECT AVG(rating)::NUMERIC(3,2) FROM movie_reviews WHERE movie_id = m.id AND is_approved = TRUE) AS average_rating
       FROM movies m
       LEFT JOIN users u ON m.filmmaker_id = u.id
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE m.is_featured = TRUE AND m.status = 'approved'
       ORDER BY m.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  static async getTrending(limit = 10) {
    const result = await query(
      `SELECT m.*, u.first_name AS filmmaker_first_name, u.last_name AS filmmaker_last_name,
              c.name AS category_name,
              COUNT(DISTINCT mp.id) AS purchase_count,
              (SELECT AVG(rating)::NUMERIC(3,2) FROM movie_reviews WHERE movie_id = m.id AND is_approved = TRUE) AS average_rating
       FROM movies m
       LEFT JOIN users u ON m.filmmaker_id = u.id
       LEFT JOIN categories c ON m.category_id = c.id
       LEFT JOIN movie_purchases mp ON m.id = mp.movie_id
       WHERE m.status = 'approved'
       GROUP BY m.id, u.first_name, u.last_name, c.name
       ORDER BY purchase_count DESC, m.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

export default Movie;

