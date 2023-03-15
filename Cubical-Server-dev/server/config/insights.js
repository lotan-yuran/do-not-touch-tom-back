const appInsights = require("applicationinsights");
appInsights
  .setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectConsole(true)
  .start();
module.exports = { client: appInsights.defaultClient };
