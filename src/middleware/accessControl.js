import Subscription from '../models/Subscription.js';
import MoviePurchase from '../models/MoviePurchase.js';
import MoviePricing from '../models/MoviePricing.js';

export const checkMovieAccess = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const quality = req.query.quality || '1080p';

    // Check if user has active subscription
    const subscription = await Subscription.findActiveByUserId(req.user.id);
    if (subscription) {
      return next(); // Subscription grants access to all movies
    }

    // Check if movie is free
    const pricing = await MoviePricing.findByMovieAndQuality(movieId, quality);
    if (pricing && pricing.is_free) {
      return next(); // Free movies are accessible
    }

    // Check if user has active purchase for this movie/quality
    const purchase = await MoviePurchase.findActivePurchase(
      req.user.id,
      movieId,
      quality
    );

    if (purchase) {
      return next(); // User has valid purchase
    }

    // Check if user has any active purchase for this movie (different quality)
    const anyPurchase = await MoviePurchase.findAnyActivePurchase(
      req.user.id,
      movieId
    );

    if (anyPurchase) {
      // User has access but different quality - allow but might want to upgrade
      return next();
    }

    // No access
    return res.status(403).json({
      success: false,
      error: 'Access denied. Please purchase this movie or subscribe to access it.',
      data: {
        requires_purchase: true,
        movie_id: movieId,
        quality
      }
    });
  } catch (error) {
    next(error);
  }
};

export const checkSubscriptionAccess = async (req, res, next) => {
  try {
    const subscription = await Subscription.findActiveByUserId(req.user.id);
    
    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'Active subscription required',
        data: {
          requires_subscription: true
        }
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    next(error);
  }
};

