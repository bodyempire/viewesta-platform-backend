import Watchlist from '../models/Watchlist.js';
import Movie from '../models/Movie.js';

export const getWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const movies = await Watchlist.getByUserId(userId, limit, offset);
    const total = await Watchlist.getCount(userId);

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

export const addToWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const isInWatchlist = await Watchlist.isInWatchlist(userId, movieId);
    if (isInWatchlist) {
      return res.json({ success: true, message: 'Movie is already in your watchlist', data: { movie_id: movieId } });
    }

    await Watchlist.add(userId, movieId);
    res.status(201).json({ success: true, message: 'Movie added to watchlist', data: { movie_id: movieId } });
  } catch (error) {
    next(error);
  }
};

export const removeFromWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    const removed = await Watchlist.remove(userId, movieId);
    if (!removed) {
      return res.status(404).json({ success: false, error: 'Movie not found in watchlist' });
    }

    res.json({ success: true, message: 'Movie removed from watchlist' });
  } catch (error) {
    next(error);
  }
};

export const checkWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    const isInWatchlist = await Watchlist.isInWatchlist(userId, movieId);

    res.json({ success: true, data: { movie_id: movieId, is_in_watchlist: isInWatchlist } });
  } catch (error) {
    next(error);
  }
};

