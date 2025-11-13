import Favorites from '../models/Favorites.js';
import Movie from '../models/Movie.js';

export const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const movies = await Favorites.getByUserId(userId, limit, offset);
    const total = await Favorites.getCount(userId);

    res.json({
      success: true,
      data: {
        movies,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const addToFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const isFavorite = await Favorites.isFavorite(userId, movieId);
    if (isFavorite) {
      return res.json({ success: true, message: 'Movie is already in your favorites', data: { movie_id: movieId } });
    }

    await Favorites.add(userId, movieId);
    res.status(201).json({ success: true, message: 'Movie added to favorites', data: { movie_id: movieId } });
  } catch (error) {
    next(error);
  }
};

export const removeFromFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    const removed = await Favorites.remove(userId, movieId);
    if (!removed) {
      return res.status(404).json({ success: false, error: 'Movie not found in favorites' });
    }

    res.json({ success: true, message: 'Movie removed from favorites' });
  } catch (error) {
    next(error);
  }
};

export const checkFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    const isFavorite = await Favorites.isFavorite(userId, movieId);

    res.json({ success: true, data: { movie_id: movieId, is_favorite: isFavorite } });
  } catch (error) {
    next(error);
  }
};

