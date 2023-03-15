const environments = {
  PROD: "production",
  DEV: "development",
  TEST: "test",
  LOCAL: "localhost"
};

const appointmentStatuses = {
  ACTIVE: 1,
  CANCELLED_BY_USER: 2,
  CANCELLED_BY_NON_ACTIVE_STATION: 3,
  CANCELLED_BY_ADMIN: 4
};

const stationTypes = {
  COMMON_AREA: 1,
  OFFICE: 2,
  PERSONAL_STATION: 3
};

const customError = require("./customError");
const { serviceTypes } = require("./serviceTypes");

module.exports = {
  appointmentStatuses,
  stationTypes,
  environments,
  customError,
  serviceTypes
};
