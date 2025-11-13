import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

class User {
  static async create(userData) {
    const {
      email,
      phone,
      password,
      first_name,
      last_name,
      user_type = 'viewer'
    } = userData;

    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const verification_token = uuidv4();

    const queryText = `
      INSERT INTO users (
        email, phone, password_hash, first_name, last_name,
        user_type, verification_token
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, phone, first_name, last_name, user_type, is_verified, is_active, verification_token, created_at
    `;

    const values = [
      email,
      phone || null,
      password_hash,
      first_name,
      last_name,
      user_type,
      verification_token
    ];

    const result = await query(queryText, values);
    const user = result.rows[0];

    if (user_type !== 'admin') {
      await query('INSERT INTO user_wallets (user_id, balance, currency) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO NOTHING', [user.id, 0.0, 'USD']);
    }

    await query('INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [user.id]);

    return user;
  }

  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findByPhone(phone) {
    const result = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async update(id, updateData) {
    const allowedFields = ['first_name', 'last_name', 'phone', 'avatar_url', 'is_verified', 'is_active'];
    const fields = [];
    const values = [];
    let param = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
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
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${param} RETURNING id, email, phone, first_name, last_name, user_type, is_verified, is_active, avatar_url, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  }

  static async updatePassword(id, newPassword) {
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    const result = await query(
      `UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2 RETURNING id, email`,
      [password_hash, id]
    );
    return result.rows[0] || null;
  }

  static async setVerificationToken(email, token) {
    const result = await query(
      `UPDATE users SET verification_token = $1 WHERE email = $2 RETURNING id, email, verification_token`,
      [token, email]
    );
    return result.rows[0] || null;
  }

  static async verifyEmail(token) {
    const result = await query(
      `UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING id, email, is_verified`,
      [token]
    );
    return result.rows[0] || null;
  }

  static async setPasswordResetToken(email, token, expiresAt) {
    const result = await query(
      `UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3 RETURNING id, email`,
      [token, expiresAt, email]
    );
    return result.rows[0] || null;
  }

  static async findByResetToken(token) {
    const result = await query(
      `SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()`,
      [token]
    );
    return result.rows[0] || null;
  }

  static async findWithProfile(id) {
    const result = await query(
      `SELECT u.*, up.bio, up.date_of_birth, up.gender, up.country, up.city, up.preferences,
              uw.balance AS wallet_balance, uw.currency
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN user_wallets uw ON u.id = uw.user_id
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await query(
      `UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING id, email`,
      [id]
    );
    return result.rows[0] || null;
  }
}

export default User;

