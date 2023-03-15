const responseHandler = require("../utilities").responseHandler;

module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.body.userId = req.user;
    req.query.userId = req.user;
    return next();
  }
  return responseHandler.unauthorized(res);
};
