const axios = require("axios");
const { trackException, trackEvent } = require("../logs");
const { getAccessToken } = require("../accessToken");

const axiosCookieInstance = axios.create({
  baseURL: process.env.COOKIE_API,
  headers: {
    "Content-Type": "application/json",
    "Cookie-Subscription-Key": process.env.COOKIE_SUBSCRIPTION_KEY
  }
});

axiosCookieInstance.interceptors.request.use(async config => {
  try {
    token = await getAccessToken(process.env.COOKIE_SCOPE);
    trackEvent("getAccessToken", { token });
  } catch (err) {
    trackException(err, { name: "unable to get token" });
    throw err;
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const getUserDetailsFromCookieData = data => {
  const first_name = data?.first_name;
  const last_name = data?.last_name;
  const cellphone_num = data?.cellphone_num;
  const service_type = parseInt(data?.service_type?.code);

  if (!first_name && !last_name) {
    throw new Error("unable to get user details");
  }

  return {
    first_name,
    last_name,
    cellphone_num,
    service_type
  };
};

const getPhoneByPersonalId = async personalId => {
  try {
    trackEvent("getPhoneByPersonalId", { personalId });
    const result = await axiosCookieInstance.post("/soldiers/tzs", {
      tzs: [personalId.toString()]
    });

    const phoneNumber = result?.data[0]?.cellphone_num;

    if (!phoneNumber) {
      throw new Error("user's phone number was not found");
    }

    return phoneNumber;
  } catch (err) {
    trackException(err, { name: "error getting user info" });
    throw err;
  }
};

const getBasicInfoByPersonalId = async personalId => {
  try {
    trackEvent("getBasicInfoByPersonalId", { personalId });
    const result = await axiosCookieInstance.post("/soldiers/tzs", {
      tzs: [personalId.toString()]
    });

    return getUserDetailsFromCookieData(result?.data[0]);
  } catch (err) {
    trackException(err, { name: "error getting user info" });
    throw err;
  }
};

module.exports = { getPhoneByPersonalId, getBasicInfoByPersonalId };
