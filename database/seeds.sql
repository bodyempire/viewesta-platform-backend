-- Viewesta Platform Seed Data

-- Categories
INSERT INTO categories (name, description, slug, is_active) VALUES
('Action', 'High-energy action-packed African movies', 'action', true),
('Drama', 'Compelling African drama stories', 'drama', true),
('Comedy', 'African comedies', 'comedy', true),
('Romance', 'African romance films', 'romance', true),
('Documentary', 'Documentaries from across Africa', 'documentary', true)
ON CONFLICT (slug) DO NOTHING;

-- Admin user (password hash placeholder: Admin123!)
INSERT INTO users (email, password_hash, first_name, last_name, user_type, is_verified, is_active) VALUES
('admin@viewesta.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', 'Admin', 'User', 'admin', true, true)
ON CONFLICT (email) DO NOTHING;

-- Filmmaker user (password hash placeholder: Filmmaker123!)
INSERT INTO users (email, password_hash, first_name, last_name, user_type, is_verified, is_active) VALUES
('filmmaker@viewesta.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', 'Jane', 'Filmmaker', 'filmmaker', true, true)
ON CONFLICT (email) DO NOTHING;

-- Viewer user (password hash placeholder: Viewer123!)
INSERT INTO users (email, password_hash, first_name, last_name, user_type, is_verified, is_active) VALUES
('viewer@viewesta.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', 'John', 'Viewer', 'viewer', true, true)
ON CONFLICT (email) DO NOTHING;

-- Wallets
INSERT INTO user_wallets (user_id, balance, currency)
SELECT id, 0.00, 'USD' FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Profiles
INSERT INTO user_profiles (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Sample movies
INSERT INTO movies (title, description, synopsis, release_date, duration_minutes, filmmaker_id, category_id, status, is_featured, language, country)
SELECT
  'The African Dream',
  'An inspiring story of a young filmmaker pursuing their dreams',
  'Follow the journey of a determined filmmaker as they overcome obstacles to create their masterpiece.',
  '2024-01-15',
  120,
  u.id,
  c.id,
  'approved',
  true,
  'English',
  'Nigeria'
FROM users u, categories c
WHERE u.email = 'filmmaker@viewesta.com' AND c.slug = 'drama'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO movies (title, description, synopsis, release_date, duration_minutes, filmmaker_id, category_id, status, is_featured, language, country)
SELECT
  'Lagos Nights',
  'A thrilling action movie set in Lagos',
  'Experience the vibrant nightlife and action-packed adventures in Lagos.',
  '2024-02-20',
  105,
  u.id,
  c.id,
  'approved',
  false,
  'English',
  'Nigeria'
FROM users u, categories c
WHERE u.email = 'filmmaker@viewesta.com' AND c.slug = 'action'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Pricing
INSERT INTO movie_pricing (movie_id, quality, price, is_free)
SELECT id, '480p', 2.99, false FROM movies WHERE title = 'The African Dream'
ON CONFLICT (movie_id, quality) DO NOTHING;

INSERT INTO movie_pricing (movie_id, quality, price, is_free)
SELECT id, '720p', 4.99, false FROM movies WHERE title = 'The African Dream'
ON CONFLICT (movie_id, quality) DO NOTHING;

INSERT INTO movie_pricing (movie_id, quality, price, is_free)
SELECT id, '1080p', 6.99, false FROM movies WHERE title = 'The African Dream'
ON CONFLICT (movie_id, quality) DO NOTHING;

INSERT INTO movie_pricing (movie_id, quality, price, is_free)
SELECT id, '4K', 9.99, false FROM movies WHERE title = 'The African Dream'
ON CONFLICT (movie_id, quality) DO NOTHING;

