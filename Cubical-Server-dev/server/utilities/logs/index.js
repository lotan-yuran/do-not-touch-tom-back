const { client } = require("../../../server/config/insights");

module.exports = {
  trackException: (exception, properties = null) => {
    console.log(exception, properties);
    client.trackException({
      exception,
      properties
    });
  },
  trackEvent: (name, properties = null) => {
    console.log(name, properties);
    client.trackEvent({
      name,
      properties
    });
  }
};
