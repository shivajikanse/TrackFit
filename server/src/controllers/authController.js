const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
  return { accessToken, refreshToken };
};

/**
 * @desc    Register a new user (trainer or member)
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, trainerId, profile } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email is already registered.', 400);
    }

    // If registering as member, validate trainer
    let trainerRef = null;
    if (role === 'member') {
      if (!trainerId) {
        return errorResponse(res, 'Trainer ID is required when registering as a member.', 400);
      }
      const trainer = await User.findOne({ _id: trainerId, role: 'trainer', isActive: true });
      if (!trainer) {
        return errorResponse(res, 'Invalid trainer ID.', 400);
      }
      trainerRef = trainerId;
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      trainer: trainerRef,
      profile: profile || {},
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    logger.info(`New ${role} registered: ${email}`);

    successResponse(
      res,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
      'Registration successful.',
      201
    );
  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      return errorResponse(res, 'Invalid credentials.', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated. Contact support.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials.', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    logger.info(`User logged in: ${email}`);

    successResponse(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    }, 'Login successful.');
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required.', 400);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ _id: decoded.id }).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 'Invalid refresh token.', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    successResponse(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed.');
  } catch (error) {
    errorResponse(res, 'Invalid or expired refresh token.', 401);
  }
};

/**
 * @desc    Get logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('trainer', 'name email');
    successResponse(res, user, 'Profile fetched.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
exports.updateMe = async (req, res) => {
  try {
    const { name, profile } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, profile },
      { new: true, runValidators: true }
    );
    successResponse(res, user, 'Profile updated.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Logout
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    successResponse(res, null, 'Logged out successfully.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
