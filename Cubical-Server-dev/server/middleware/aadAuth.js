const responseHandler = require("../utilities").responseHandler;

module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    // Todo: return it back
    // req.body.userId = req.user;
    // req.query.userId = req.user;

    req.body.userId = "322592973";
    req.query.userId = "322592973";
    return next();
  }
  return responseHandler.unauthorized(res);
};
