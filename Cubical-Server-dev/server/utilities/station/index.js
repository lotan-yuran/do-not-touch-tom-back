const DAL = require("../../DAL");
const stationTypeMDL = require("../../../database/models").StationType;

const getStationInterval = async stationTypeId => {
  const stationType = await DAL.FindOne(stationTypeMDL, { where: { id: stationTypeId } });
  if (stationType) {
    return stationType.assignment_minute_interval;
  }
  return null;
};

module.exports = { getStationInterval };
