import { query } from '../config/database.js';

class Category {
  static async create(data) {
    const { name, description, slug, icon_url } = data;
    const result = await query(
      `INSERT INTO categories (name, description, slug, icon_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, slug, icon_url, is_active, created_at, updated_at`,
      [name, description || null, slug, icon_url || null]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findBySlug(slug) {
    const result = await query('SELECT * FROM categories WHERE slug = $1', [slug]);
    return result.rows[0] || null;
  }

  static async findAll(includeInactive = false) {
    let text = 'SELECT * FROM categories';
    if (!includeInactive) {
      text += ' WHERE is_active = TRUE';
    }
    text += ' ORDER BY name ASC';
    const result = await query(text);
    return result.rows;
  }

  static async update(id, data) {
    const allowed = ['name', 'description', 'slug', 'icon_url', 'is_active'];
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
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${param}
       RETURNING id, name, description, slug, icon_url, is_active, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await query(
      `UPDATE categories SET is_active = FALSE WHERE id = $1 RETURNING id, name`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findWithMovieCount(id) {
    const result = await query(
      `SELECT c.*, COUNT(m.id) AS movie_count
       FROM categories c
       LEFT JOIN movies m ON c.id = m.category_id AND m.status = 'approved'
       WHERE c.id = $1
       GROUP BY c.id`,
      [id]
    );
    return result.rows[0] || null;
  }
}

export default Category;

