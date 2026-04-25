const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) {
      return errorResponse(res, 'Token is invalid. User not found.', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);

    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired. Please login again.', 401);
    }

    return errorResponse(res, 'Authentication failed.', 500);
  }
};

/**
 * Restrict access to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Role '${req.user.role}' is not authorized for this action.`,
        403
      );
    }
    next();
  };
};

/**
 * Trainer-only middleware
 */
const trainerOnly = authorize('trainer');

/**
 * Member-only middleware
 */
const memberOnly = authorize('member');

/**
 * Verify trainer owns the member
 */
const verifyTrainerMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const member = await User.findOne({
      _id: memberId,
      trainer: req.user._id,
      role: 'member',
    });

    if (!member) {
      return errorResponse(
        res,
        'Member not found or does not belong to you.',
        404
      );
    }

    req.member = member;
    next();
  } catch (error) {
    return errorResponse(res, 'Error verifying member ownership.', 500);
  }
};

module.exports = { protect, authorize, trainerOnly, memberOnly, verifyTrainerMember };
