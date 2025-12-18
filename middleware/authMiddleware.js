import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/* ----------------------------------------
   PROTECT: Checks JWT token
-----------------------------------------*/
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // No token → blocked
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — Token missing',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id, role: decoded.role };

    // attach user document
    req.userDoc = await User.findById(req.user.id).select('-password -refreshTokens');

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
});


/* ----------------------------------------
   ADMIN MIDDLEWARE
-----------------------------------------*/
export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access denied' });
  }

  next();
};


/* ----------------------------------------
   BUSINESS MIDDLEWARE
-----------------------------------------*/
export const businessMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  if (req.user.role !== 'business') {
    return res.status(403).json({
      success: false,
      message: 'Business access required',
    });
  }

  next();
};
