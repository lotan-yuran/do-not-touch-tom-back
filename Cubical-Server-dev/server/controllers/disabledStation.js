const DAL = require("../DAL");
const { Op } = require("sequelize");
const moment = require("moment");
const { trackEvent } = require("../utilities/logs");

// models

const disabledStationModel = require("../../database/models").DisabledStation;
const disableComplexModel = require("../../database/models").disabledComplex;
const stationModel = require("../../database/models").Station;
module.exports = {
  async getStationDisables(stationId) {
    const res = await DAL.Find(disabledStationModel, {
      where: { station_id: stationId }
    });

    trackEvent("station disables ", res);
    return res;
  },
  async createDisables(disableData, transaction) {
    trackEvent("create disables ", disableData);

    return await DAL.BulkCreate(disabledStationModel, disableData, { transaction });
  },
  async deleteAllDisables(stationId, transaction) {
    return await DAL.Delete(disabledStationModel, { transaction, where: { station_id: stationId } });
  },
  async deleteDisables(disablesToDelete, transaction) {
    return await DAL.Delete(disabledStationModel, {
      transaction: transaction,
      where: { id: { [Op.in]: disablesToDelete } }
    });
  },
  async getCurrentDisabledStations(complexId, stationTypeId, beginTime = [moment()]) {
    const timeFilter = beginTime.map(time => {
      return {
        start_date: { [Op.lte]: time },
        end_date: { [Op.gt]: time }
      };
    });

    const disabledStation = await DAL.Find(disabledStationModel, {
      where: {
        ...(complexId && { complex_id: complexId }),
        ...(stationTypeId && { station_type_id: stationTypeId }),
        [Op.or]: timeFilter
      },
      attributes: ["station_id"],
      raw: true
    });

    const disabledComplex = await DAL.Find(disableComplexModel, {
      where: {
        ...(complexId && { complex_id: complexId }),
        [Op.or]: timeFilter
      },
      attributes: ["complex_id"],
      raw: true
    });
    const disableComplexId = disabledComplex.map(({ complex_id }) => complex_id);

    const disabledComplexStation = await DAL.Find(stationModel, {
      where: {
        ...(disabledComplex && { complex_id: disableComplexId })
      },
      attributes: ["id"],
      raw: true
    });

    const disabledStationIds = disabledStation.map(({ station_id }) => station_id);
    const disabledComplexStationIds = disabledComplexStation.map(({ id }) => id);

    const ids = [...disabledStationIds, ...disabledComplexStationIds];
    trackEvent("getCurrentDisabledStations", { ids });

    return ids;
  },

  async getPermanentlyDisabledStations(complexId, stationTypeId, time = moment()) {
    let beginDay = moment(time).startOf("day");
    let endDay = moment(time).endOf("day");
    const disabledStation = await DAL.Find(disabledStationModel, {
      where: {
        ...(complexId && { complex_id: complexId }),
        ...(stationTypeId && { station_type_id: stationTypeId }),
        start_date: { [Op.lte]: beginDay },
        end_date: { [Op.gt]: endDay }
      },
      attributes: ["station_id"],
      raw: true
    });

    const disabledStationIds = disabledStation.map(({ station_id }) => station_id);

    const ids = [...disabledStationIds];

    trackEvent("getCurrentDisabledStations", { ids });

    return ids;
  },

  async getCurrentDisabledStationsTimes(complexId, stationTypeId, stationId, time = moment(), potential) {
    let currentTime = moment(time).startOf("day");
    let beginTime = currentTime;
    let endTime = moment(time).endOf("day");
    let where = {
      ...(complexId && { complex_id: complexId }),
      ...(stationTypeId && { station_type_id: stationTypeId }),
      end_date: { [Op.gt]: beginTime },
      start_date: { [Op.lte]: endTime }
    };
    if (stationId) {
      where.station_id = stationId;
    }

    const disabledStation = await DAL.Find(disabledStationModel, {
      where: where,
      attributes: ["station_id", "start_date", "end_date"],
      raw: true
    });
    let res = [];
    const disabledComplex = await DAL.Find(disableComplexModel, {
      where: {
        ...(complexId && { complex_id: complexId }),
        end_date: { [Op.gt]: beginTime },
        start_date: { [Op.lte]: endTime }
      },
      attributes: ["complex_id", "start_date", "end_date"],
      raw: true
    });
    if (disabledComplex.length > 0) {
      const disableComplexId = disabledComplex.map(({ complex_id }) => complex_id);

      const disabledComplexStation = await DAL.Find(stationModel, {
        where: {
          ...(disabledComplex && { complex_id: disableComplexId })
        },
        attributes: ["id"],
        raw: true
      });

      let disabledComplexStationIds = [];
      disabledComplexStation.forEach(({ id }) => {
        const currentComplexDisable = {
          ...disabledComplex.forEach(({ end_date, start_date }) => {
            disabledComplexStationIds.push({ id, start_date: start_date, end_date: end_date });
          })
        };
      });

      res = [...disabledStation, ...disabledComplexStationIds];
    } else {
      res = disabledStation;
    }

    let disableHours = [];
    if (!res || !res.length) {
      return disableHours;
    }
    currentTime = currentTime.format("X");
    endTime = endTime.format("X");
    const potentialSize = potential.length;
    while (currentTime < endTime) {
      const disableSize = res.filter(({ start_date, end_date }) => {
        const start = moment(start_date);
        const end = moment(end_date);
        const endTimeRoundUp = end.endOf("hour");

        const startTimeRoundDown = start.startOf("hour");
        const answer =
          currentTime >= startTimeRoundDown.format("X") && currentTime <= endTimeRoundUp.format("X");
        return answer;
      }).length;

      if (disableSize >= potentialSize) {
        disableHours.push(moment(currentTime, "X"));
      }
      currentTime = moment(currentTime, "X").add(1, "hour").format("X");
    }

    trackEvent("getCurrentDisabledStations", { disableHours });

    return disableHours;
  }
};
