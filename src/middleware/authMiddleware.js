import { verifyToken } from '../utils/auth.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    if (!user.is_active) {
      return res.status(401).json({ success: false, error: 'User account is inactive' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      userType: user.user_type
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.userType)) {
    return res.status(403).json({ success: false, error: 'Not authorized to access this route' });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          userType: user.user_type
        };
      }
    }
  } catch (error) {
    // Ignore errors, proceed without user
  }
  next();
};

