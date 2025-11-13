import MoviePricing from '../models/MoviePricing.js';
import Movie from '../models/Movie.js';

export const getMoviePricing = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }
    const pricing = await MoviePricing.getByMovieId(movieId);
    res.json({ success: true, data: { movie_id: movieId, pricing } });
  } catch (error) {
    next(error);
  }
};

export const setPricing = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { quality, price, is_free } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const isOwner = movie.filmmaker_id === req.user.id;
    const isAdmin = req.user.userType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to set pricing for this movie' });
    }

    const validQualities = ['480p', '720p', '1080p', '4K'];
    if (!validQualities.includes(quality)) {
      return res.status(400).json({ success: false, error: `Invalid quality. Must be one of: ${validQualities.join(', ')}` });
    }

    if (!is_free && (price === undefined || price < 0)) {
      return res.status(400).json({ success: false, error: 'Price must be a positive number or movie must be marked as free' });
    }

    const pricing = await MoviePricing.setPricing(movieId, quality, is_free ? 0 : parseFloat(price), is_free || false);

    res.json({ success: true, message: 'Pricing set successfully', data: { pricing } });
  } catch (error) {
    next(error);
  }
};

export const updatePricing = async (req, res, next) => {
  try {
    const { movieId, quality } = req.params;
    const { price, is_free } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const isOwner = movie.filmmaker_id === req.user.id;
    const isAdmin = req.user.userType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to update pricing for this movie' });
    }

    const existing = await MoviePricing.getPrice(movieId, quality);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Pricing not found for this quality' });
    }

    if (!is_free && (price === undefined || price < 0)) {
      return res.status(400).json({ success: false, error: 'Price must be a positive number or movie must be marked as free' });
    }

    const updated = await MoviePricing.update(movieId, quality, {
      price: is_free ? 0 : parseFloat(price),
      is_free: is_free || false
    });

    res.json({ success: true, message: 'Pricing updated successfully', data: { pricing: updated } });
  } catch (error) {
    next(error);
  }
};

export const deletePricing = async (req, res, next) => {
  try {
    const { movieId, quality } = req.params;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const isOwner = movie.filmmaker_id === req.user.id;
    const isAdmin = req.user.userType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete pricing for this movie' });
    }

    const deleted = await MoviePricing.delete(movieId, quality);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Pricing not found' });
    }

    res.json({ success: true, message: 'Pricing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

