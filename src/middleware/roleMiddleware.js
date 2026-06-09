// Simple role middleware placeholder
module.exports = function roleMiddleware(role) {
  return (req, res, next) => {
    // In real app validate req.user.role
    next();
  };
};
