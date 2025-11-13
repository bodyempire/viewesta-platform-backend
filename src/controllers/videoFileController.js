import VideoFile from '../models/VideoFile.js';
import Movie from '../models/Movie.js';

export const getMovieVideoFiles = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }
    const video_files = await VideoFile.getByMovieId(movieId);
    res.json({ success: true, data: { video_files } });
  } catch (error) {
    next(error);
  }
};

export const addVideoFile = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { quality, file_url, file_size, duration_seconds, s3_key } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const isOwner = movie.filmmaker_id === req.user.id;
    const isAdmin = req.user.userType === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to add video files for this movie' });
    }

    const validQualities = ['480p', '720p', '1080p', '4K'];
    if (!validQualities.includes(quality)) {
      return res.status(400).json({ success: false, error: `Invalid quality. Must be one of: ${validQualities.join(', ')}` });
    }

    const video_file = await VideoFile.create(movieId, quality, file_url, file_size, duration_seconds, s3_key);
    res.status(201).json({ success: true, message: 'Video file added successfully', data: { video_file } });
  } catch (error) {
    next(error);
  }
};

export const updateVideoFile = async (req, res, next) => {
  try {
    const { movieId, fileId } = req.params;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const isOwner = movie.filmmaker_id === req.user.id;
    const isAdmin = req.user.userType === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this video file' });
    }

    const updated = await VideoFile.update(fileId, req.body);
    res.json({ success: true, message: 'Video file updated successfully', data: { video_file: updated } });
  } catch (error) {
    next(error);
  }
};

export const deleteVideoFile = async (req, res, next) => {
  try {
    const { movieId, fileId } = req.params;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const isOwner = movie.filmmaker_id === req.user.id;
    const isAdmin = req.user.userType === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this video file' });
    }

    await VideoFile.delete(fileId);
    res.json({ success: true, message: 'Video file deleted successfully' });
  } catch (error) {
    next(error);
  }
};

