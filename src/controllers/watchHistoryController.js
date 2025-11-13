import WatchHistory from '../models/WatchHistory.js';
import Movie from '../models/Movie.js';

export const getWatchHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const history = await WatchHistory.getByUserId(req.user.id, limit, offset);
    res.json({ success: true, data: { history } });
  } catch (error) {
    next(error);
  }
};

export const getContinueWatching = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const movies = await WatchHistory.getContinueWatching(req.user.id, limit);
    res.json({ success: true, data: { movies } });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { watch_time_seconds, last_position_seconds, is_completed } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const history = await WatchHistory.updateHistory(
      req.user.id,
      movieId,
      watch_time_seconds || 0,
      last_position_seconds || 0,
      is_completed || false
    );

    res.json({ success: true, message: 'Watch progress updated', data: { history } });
  } catch (error) {
    next(error);
  }
};

export const deleteHistory = async (req, res, next) => {
  try {
    const deleted = await WatchHistory.delete(req.user.id, req.params.movieId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Watch history not found' });
    }
    res.json({ success: true, message: 'Watch history deleted' });
  } catch (error) {
    next(error);
  }
};

