import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

export const register = async (req, res, next) => {
  try {
    const { email, phone, password, first_name, last_name, user_type } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    if (phone) {
      const existingPhone = await User.findByPhone(phone);
      if (existingPhone) {
        return res.status(400).json({ success: false, error: 'User with this phone number already exists' });
      }
    }

    const user = await User.create({ email, phone, password, first_name, last_name, user_type });
    const token = generateToken(user.id, user.user_type);

    try {
      await sendVerificationEmail(user.email, user.verification_token);
    } catch (error) {
      console.error('Failed to send verification email:', error.message);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
          is_verified: user.is_verified
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ success: false, error: 'Account is inactive. Please contact support.' });
    }

    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.user_type);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
          is_verified: user.is_verified,
          avatar_url: user.avatar_url
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findWithProfile(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
          is_verified: user.is_verified,
          avatar_url: user.avatar_url,
          bio: user.bio,
          wallet_balance: user.wallet_balance,
          currency: user.currency,
          created_at: user.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updated = await User.update(userId, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully', data: { user: updated } });
  } catch (error) {
    next(error);
  }
};

export const requestVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.json({ success: true, message: 'If the email exists, a verification link has been sent.' });
    }

    if (user.is_verified) {
      return res.json({ success: true, message: 'Email is already verified' });
    }

    const verification_token = uuidv4();
    await User.setVerificationToken(email, verification_token);

    try {
      await sendVerificationEmail(user.email, verification_token);
      res.json({ success: true, message: 'Verification email sent. Please check your inbox.' });
    } catch (error) {
      console.error('Failed to send verification email:', error.message);
      res.status(500).json({ success: false, error: 'Failed to send verification email' });
    }
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.verifyEmail(token);

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
    }

    res.json({ success: true, message: 'Email verified successfully', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.json({ success: true, message: 'If the email exists, a password reset link has been sent.' });
    }

    const reset_token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await User.setPasswordResetToken(email, reset_token, expiresAt);

    try {
      await sendPasswordResetEmail(user.email, reset_token);
      res.json({ success: true, message: 'Password reset email sent. Please check your inbox.' });
    } catch (error) {
      console.error('Failed to send password reset email:', error.message);
      res.status(500).json({ success: false, error: 'Failed to send password reset email' });
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findByResetToken(token);

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    await User.updatePassword(user.id, password);

    res.json({ success: true, message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isPasswordValid = await User.verifyPassword(current_password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    await User.updatePassword(req.user.id, new_password);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

