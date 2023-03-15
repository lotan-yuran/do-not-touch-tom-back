const axios = require("axios");
const TOKEN_ENDPOINT = `https://login.microsoftonline.com/${process.env.AAD_TENANT_ID}/oauth2/v2.0/token`;
const TOKEN_EXPIRATION = 60 * 60 * 1000;
let token = {};
let expires = {};

const isTokenFresh = scope => {
  return token[scope] && expires[scope] > Date.now();
};
const getAccessToken = async scope => {
  if (isTokenFresh(scope)) {
    return token[scope];
  }
  try {
    const TOKEN_BODY = `client_id=${process.env.AAD_CLIENT_ID}
                    &scope=${scope}
                    &client_secret=${process.env.AAD_CLIENT_SECRET}
                    &grant_type=client_credentials`;

    const response = await axios.post(TOKEN_ENDPOINT, TOKEN_BODY, {
      headers: {
        Host: "login.microsoftonline.com",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    token[scope] = response.data.access_token;
    expires[scope] = Date.now() + TOKEN_EXPIRATION;
    return token[scope];
  } catch (err) {
    throw new Error(`Failed to get access token with error: ${err}`);
  }
};

module.exports = { getAccessToken };
