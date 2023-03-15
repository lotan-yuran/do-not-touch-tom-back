const {
  getPhoneByPersonalId: getPhoneByPersonalIdCookie,
  getBasicInfoByPersonalId: getBasicInfoByPersonalIdCookie
} = require("../digital/cookie");

const getServiceTypeById = async userId => {
  if (!userId) {
    throw new HttpError({ error: customResErrors.parametersValidation });
  }
  const data = await getBasicInfoByPersonalId(userId);

  return data?.service_type ?? 1;
};
const getPhoneByPersonalId = async userId => {
  return await getPhoneByPersonalIdCookie(userId);
};
const getBasicInfoByPersonalId = async userId => {
  return await getBasicInfoByPersonalIdCookie(userId);
};

module.exports = { getServiceTypeById, getPhoneByPersonalId, getBasicInfoByPersonalId };
