/**
 * Check auth middleware
 * @author Yousuf Kalim
 */
const jwt = require('jsonwebtoken');
const Admins = require('../models/Admins');
const Users = require('../models/Users');
const tokenSecret = process.env.JWT_SECRET;

// Check auth
exports.checkAuth = async (req, res, next) => {
  // Get token from Header
  const header = req.get('Authorization');

  // Check if not token
  if (!header || !header.startsWith('Bearer')) {
    return res.status(403).json({
      success: false,
      message: 'No token found, Authorization denied',
    });
  }

  try {
    // Decrypting token
    const token = header.split(' ')[1];
    const { user } = jwt.verify(token, tokenSecret);

    let userChk;
    if (user.role === 'user') {
      userChk = await Users.findById(user._id);
    } else {
      userChk = await Admins.findById(user._id);
    }

    if (!userChk) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this resource',
      });
    }

    req.user = userChk;

    // If user authenticated
    res.set(
      'cache-control',
      'no-cache, no-store, private, must-revalidate, post-check=0, pre-check=0',
    );

    // Done
    next();
  } catch (err) {
    // If not
    res.status(403).json({ success: false, message: 'Your session has been expired' });
  }
};

exports.checkAdminAuth = async (req, res, next) => {
  // Get token from Header
  const header = req.get('Authorization');

  // Check if not token
  if (!header || !header.startsWith('Bearer')) {
    return res.status(403).json({
      success: false,
      message: 'No token found, Authorization denied',
    });
  }

  try {
    // Decrypting token
    const token = header.split(' ')[1];
    const { user } = jwt.verify(token, tokenSecret);

    let userChk = await Admins.findById(user._id);

    if (!userChk || !['admin', 'superadmin'].includes(userChk.role) || !userChk.active) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this resource',
      });
    }

    req.user = userChk;
    req.token = token;

    // If user authenticated
    res.set(
      'cache-control',
      'no-cache, no-store, private, must-revalidate, post-check=0, pre-check=0',
    );

    // Done
    next();
  } catch (err) {
    // If not
    res.status(403).json({ success: false, message: 'Your session has been expired' });
  }
};
// Check auth
exports.checkSuperAdminAuth = async (req, res, next) => {
  // Get token from Header
  const header = req.get('Authorization');

  // Check if not token
  if (!header || !header.startsWith('Bearer')) {
    return res.status(403).json({
      success: false,
      message: 'No token found, Authorization denied',
    });
  }

  try {
    // Decrypting token
    const token = header.split(' ')[1];
    const { user } = jwt.verify(token, tokenSecret);

    let userChk = await Admins.findById(user._id);

    if (!userChk || userChk.role !== 'superadmin' || !userChk.active) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this resource',
      });
    }

    req.user = userChk;
    req.token = token;

    // If user authenticated
    res.set(
      'cache-control',
      'no-cache, no-store, private, must-revalidate, post-check=0, pre-check=0',
    );

    // Done
    next();
  } catch (err) {
    // If not
    res.status(403).json({ success: false, message: 'Your session has been expired' });
  }
};

exports.checkUserId = (id) => (req, res, next) => {
  if (req.user.role === 'user' && req.params[id] !== req.user._id) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to access this resource',
    });
  }
  next();
};

exports.checkToken = (req, res, next) => {
  try {
    let { token } = req.body;
    let { id } = jwt.verify(token, tokenSecret);
    req.userId = id;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Token expired.' });
  }
};
