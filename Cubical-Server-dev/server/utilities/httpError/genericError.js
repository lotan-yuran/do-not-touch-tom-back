const { StatusCodes } = require("http-status-codes");

const genericError = (res, err) => {
  res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
};

module.exports = { genericError };
