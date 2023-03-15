const chalk = require("chalk");

const { BearerStrategy } = require("passport-azure-ad");
const { trackEvent } = require("../utilities/logs");
const TENANT_ID = process.env.AAD_TENANT_ID;
const CLIENT_ID = process.env.AAD_CLIENT_ID;
const IS_AAD_ENABLED = process.env.AAD_AUTH_ENABLED !== "false";

const AzureCredentials = {
  identityMetadata: `https://login.microsoftonline.com/${TENANT_ID}/v2.0/.well-known/openid-configuration`,
  clientID: CLIENT_ID,
  validateIssuer: true,
  issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
  audience: CLIENT_ID
};

const authMsg = IS_AAD_ENABLED ? chalk.bgBlack.bold.greenBright : chalk.bgBlack.bold.grey;
console.log(authMsg(`[Auth] ${IS_AAD_ENABLED}`));

const AzureStrategy = new BearerStrategy(AzureCredentials, (token, done) => {
  if (token && token.preferred_username) {
    const userId = token.preferred_username.slice(0, 9);
    trackEvent("auth success", { userId });
    // userId inserted into req.user
    return done(null, userId, token);
  }

  return done(null, {}, token);
});

module.exports = {
  IS_AAD_ENABLED,
  AzureStrategy
};
