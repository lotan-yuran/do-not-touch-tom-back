const { isNullOrUndefinedOrEmpty } = require("../helpers");
// const { getServiceTypeById } = require("../utilities/user");
// const { serviceTypes } = require("../constants");

const validateUserId = userId => {
  if (typeof userId !== "string" || userId.length > 9 || !userId.match(/^\d{9}$/)) {
    return false;
  }
  return true;
};

const validatePhone = phone => {
  if (typeof phone !== "string" || phone.length > 10 || !phone.match(/^05\d{8}$/)) {
    return false;
  }
  return true;
};
const validateUserInfo = async ({ userId, fullName, phone }) => {
  if (isNullOrUndefinedOrEmpty(userId, fullName, phone) || !validatePhone(phone) || !validateUserId(userId)) {
    console.table({ userId, fullName, phone });
    throw new HttpError({
      error: customResErrors.parametersValidation,
      params: { userId, fullName, phone }
    });
  }
  return;
};

const validateUser = async userId => {
  if (isNullOrUndefinedOrEmpty(userId) || !validateUserId(userId)) {
    throw new HttpError({ error: customResErrors.parametersValidation });
  }
  try {
    // const serviceType = await getServiceTypeById(userId);
    // if (
    //   ![...serviceTypes.HOVA, ...serviceTypes.KEVA, ...serviceTypes.MILOEEM, ...serviceTypes.AHAZIM].includes(
    //     serviceType
    //   )
    // ) {
    //   const ERROR = new HttpError({ error: customResErrors.forbidden, params: { userId } });
    //   trackException(ERROR, {
    //     name: "user forbidden",
    //     function: "validateUser",
    //     userId,
    //     userServiceType: serviceType
    //   });

    //   throw ERROR;
    // }

    return;
  } catch (err) {
    // check for 404
    if (err.response && err.response.status === 404) {
      throw new HttpError({ error: customResErrors.user.userNotFound, params: { userId } });
    }
    throw err;
  }
};

module.exports = { validateUserId, validatePhone, validateUserInfo, validateUser };
