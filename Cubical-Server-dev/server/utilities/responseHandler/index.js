const HttpError = require("../httpError");
const { customResErrors, getResponseErrorObject } = require("../../constants").customError;
const environments = require("../../constants").environments;
const chalk = require("chalk");
const { trackException } = require("../../utilities/logs/index");

module.exports = {
  json(res, data) {
    res.status(200).json(data);
  },

  unauthorized(res) {
    res.status(401).json({ message: "401 Unauthorized" });
  },

  error(res, err, req) {
    trackException(err, {
      serverRoute: req.url
    });

    let responseError;
    if (err instanceof HttpError) {
      responseError = err.error;
    } else {
      responseError = getResponseErrorObject({ error: customResErrors.generic });
    }

    // log err.message - exception details
    console.error(err);
    console.error(chalk.bgBlack.redBright(err));

    if (process.env.NODE_ENV !== environments.PROD) {
      res
        .status(responseError.status)
        .json({ message: { response: responseError, stack: err.message || {} } });
    } else {
      res.status(responseError.status).json({ message: { response: { message: responseError.message } } });
    }
  }
};
