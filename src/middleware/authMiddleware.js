// Simple auth middleware placeholder
module.exports = function authMiddleware(req, res, next) {
  // In real app check JWT or session
  req.user = null;
  next();
};
