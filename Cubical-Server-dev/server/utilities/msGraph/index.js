// const fetch = require("node-fetch");
const axios = require("axios");
const { getAccessToken } = require("../accessToken");
const { trackException } = require("../logs");
const AAD_GRAPH_SCOPE = "https://graph.microsoft.com/.default";

const getClickUserByUserId = async userId => {
  try {
    const accessToken = await getAccessToken(AAD_GRAPH_SCOPE);
    const response = await axios.get(`https://graph.microsoft.com/v1.0/users/${userId}@idf.il`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (err) {
    console.log("err");
    console.log(err);
    // if user not found
    if (err?.response?.status === 404) {
      return null;
    } else {
      console.log(err);
      throw new Error(err);
    }
  }
};

const isClickUserExists = async userId => {
  const user = await getClickUserByUserId(userId);
  if (user) {
    return true;
  }
  return false;
};

const getCustomObjClickUser = async userId => {
  try {
    const user = await getClickUserByUserId(userId);
    if (!user) {
      return null;
    }
    return {
      id: userId,
      first_name: user.givenName,
      last_name: user.surname
    };
  } catch (err) {
    trackException(err, { name: "user not found in click" });
  }
};

module.exports = { getCustomObjClickUser };
