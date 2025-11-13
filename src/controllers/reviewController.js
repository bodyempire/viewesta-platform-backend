import MovieReview from '../models/MovieReview.js';
import Movie from '../models/Movie.js';

export const getMovieReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const approvedOnly = req.query.approved_only !== 'false';

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const reviews = await MovieReview.getByMovieId(movieId, limit, offset, approvedOnly);
    const stats = await MovieReview.getMovieStats(movieId);

    res.json({
      success: true,
      data: {
        reviews,
        stats: stats || {
          total_reviews: 0,
          average_rating: null,
          five_star: 0,
          four_star: 0,
          three_star: 0,
          two_star: 0,
          one_star: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    const { rating, review_text } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const review = await MovieReview.createOrUpdate(userId, movieId, rating, review_text);

    res.status(201).json({ success: true, message: 'Review submitted successfully', data: { review } });
  } catch (error) {
    next(error);
  }
};

export const getMyReview = async (req, res, next) => {
  try {
    const review = await MovieReview.getByUserAndMovie(req.user.id, req.params.movieId);
    res.json({ success: true, data: { review } });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const deleted = await MovieReview.delete(req.params.reviewId, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Review not found or not authorized' });
    }
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

