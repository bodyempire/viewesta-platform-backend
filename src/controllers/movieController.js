import Movie from '../models/Movie.js';
import Category from '../models/Category.js';

export const getMovies = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      category_id: req.query.category_id,
      filmmaker_id: req.query.filmmaker_id,
      is_featured: req.query.is_featured === 'true' ? true : req.query.is_featured === 'false' ? false : undefined,
      search: req.query.search,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
      sort_by: req.query.sort_by || 'created_at',
      order: req.query.order || 'DESC'
    };

    const movies = await Movie.findAll(filters);
    const total = await Movie.count(filters);

    res.json({
      success: true,
      data: {
        movies,
        pagination: {
          total,
          limit: filters.limit,
          offset: filters.offset,
          pages: Math.ceil(total / filters.limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }
    res.json({ success: true, data: { movie } });
  } catch (error) {
    next(error);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    if (req.user.userType !== 'filmmaker' && req.user.userType !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only filmmakers can create movies' });
    }

    const movieData = {
      ...req.body,
      filmmaker_id: req.user.userType === 'filmmaker' ? req.user.id : req.body.filmmaker_id,
      status: req.user.userType === 'admin' ? (req.body.status || 'approved') : 'pending'
    };

    if (movieData.category_id) {
      const category = await Category.findById(movieData.category_id);
      if (!category) {
        return res.status(400).json({ success: false, error: 'Category not found' });
      }
    }

    const movie = await Movie.create(movieData);
    res.status(201).json({ success: true, message: 'Movie created successfully', data: { movie } });
  } catch (error) {
    next(error);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const isOwner = movie.filmmaker_id === req.user.id;
    const isAdmin = req.user.userType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this movie' });
    }

    if (req.body.status && !isAdmin) {
      delete req.body.status;
    }

    if (req.body.category_id) {
      const category = await Category.findById(req.body.category_id);
      if (!category) {
        return res.status(400).json({ success: false, error: 'Category not found' });
      }
    }

    const updated = await Movie.update(req.params.id, req.body);
    res.json({ success: true, message: 'Movie updated successfully', data: { movie: updated } });
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const isOwner = movie.filmmaker_id === req.user.id;
    const isAdmin = req.user.userType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this movie' });
    }

    await Movie.delete(req.params.id);
    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedMovies = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const movies = await Movie.getFeatured(limit);
    res.json({ success: true, data: { movies } });
  } catch (error) {
    next(error);
  }
};

export const getTrendingMovies = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const movies = await Movie.getTrending(limit);
    res.json({ success: true, data: { movies } });
  } catch (error) {
    next(error);
  }
};

