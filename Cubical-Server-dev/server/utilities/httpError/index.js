const { getResponseErrorObject } = require("../../constants").customError;

module.exports = class HttpError extends (
  Error
) {
  constructor({ error, params }) {
    const obj = getResponseErrorObject({ error, params });
    super(obj.details);
    this.error = obj;
    this.status = obj.status;
  }
};
