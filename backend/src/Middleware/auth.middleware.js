const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'unceta_admin_token';

function requireAdmin(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: 'Authentication is required.' });

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

module.exports = { COOKIE_NAME, requireAdmin };