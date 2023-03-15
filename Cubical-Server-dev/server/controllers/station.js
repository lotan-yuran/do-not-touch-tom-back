// utilities & helpers
const DAL = require("../DAL");
const moment = require("moment");
const Op = require("../../database/models").Sequelize.Op;
const sequelize = require("../../database/models").sequelize;
const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
const HttpError = require("../utilities").HttpError;
const { isNullOrUndefinedOrEmpty, isNotObject } = require("../helpers");
const {
  deleteDisables,
  createDisables,
  getStationDisables,
  getCurrentDisabledStations,
  getPermanentlyDisabledStations
} = require("./disabledStation");
const { trackEvent, trackException } = require("../utilities/logs");
const { getStationInterval } = require("../utilities/station");
// models
const stationMDL = require("../../database/models").Station;
const stationTypeMDL = require("../../database/models").StationType;
const appointmentMDL = require("../../database/models").Appointment;

// constants
const appointmentStatuses = require("../constants").appointmentStatuses;
const { customResErrors } = require("../constants").customError;

const getStationById = async stationId => {
  return await DAL.FindByPk(stationMDL, stationId);
};

const chooseBestStation = async ({
  unavailableStations,
  stationId,
  appointmentDatetime,
  complexId,
  stationTypeId
}) => {
  const idFilter = unavailableStations?.length > 0 ? [{ id: { [Op.notIn]: unavailableStations } }] : [];

  if (stationId) {
    idFilter.push({ id: stationId });
  }

  const availableStations = await DAL.Find(stationMDL, {
    raw: true,
    attributes: ["id", "name"],
    distinct: ["id"],
    where: {
      station_type_id: stationTypeId,
      complex_id: complexId,
      [Op.and]: idFilter
    }
  });

  let availableStation = availableStations[0];

  if (!stationId) {
    const userPreviousStationThatDay = await DAL.FindOne(appointmentMDL, {
      raw: true,
      attributes: ["station_id"],
      where: {
        status_id: appointmentStatuses.ACTIVE,
        start_datetime: {
          [Op.between]: [
            moment(appointmentDatetime[0]).utc().tz("Israel").startOf("day"),
            moment(appointmentDatetime[0]).utc().tz("Israel").endOf("day")
          ]
        }
      }
    });

    if (userPreviousStationThatDay && userPreviousStationThatDay.length > 0) {
      const userPrevStationThatDay = availableStations.find(
        st => st.id === userPreviousStationThatDay.station_id
      );
      if (userPrevStationThatDay) {
        availableStation = userPrevStationThatDay;
      }
    }
  }
  return availableStation;
};

const getUnavailableStations = async ({ stationTypeId, complexId, appointmentDatetime }) => {
  const disabledStations = await getCurrentDisabledStations(complexId, stationTypeId, appointmentDatetime);

  const UNAVAILABLE_OPTIONS = {
    raw: true,
    attributes: ["station_id"],
    where: {
      status_id: appointmentStatuses.ACTIVE,
      start_datetime: { [Op.in]: appointmentDatetime }
    }
  };

  const takenStations = await DAL.Find(appointmentMDL, UNAVAILABLE_OPTIONS);
  trackEvent("unavailable stations", {
    ids: takenStations,
    disabledStations,
    function: "getAvailableStation"
  });

  const unavailableAndDisableStations = [...takenStations.map(st => st.station_id), ...disabledStations];

  return unavailableAndDisableStations;
};

module.exports = {
  async getAssignIntervalByStationType(stationTypeId) {
    return await getStationInterval(stationTypeId);
  },

  async getAvailableStation({ stationTypeId, complexId, appointmentDatetime, stationId }) {
    const unavailableStations = await getUnavailableStations({
      stationTypeId,
      complexId,
      appointmentDatetime
    });
    const bestStation = await chooseBestStation({
      unavailableStations,
      stationId,
      appointmentDatetime,
      complexId,
      stationTypeId
    });

    trackEvent("available station", { ids: bestStation, function: "getAvailableStation" });

    if (!isNullOrUndefinedOrEmpty(bestStation)) return bestStation;

    return null;
  },

  async getStationTypeNameByStationId(stationId) {
    return await DAL.FindOne(stationMDL, {
      attributes: [[Sequelize.col(`"StationType"."name"`), "name"]],
      raw: true,
      where: { id: stationId },
      include: { model: stationTypeMDL, attributes: [] }
    });
  },

  async getAllStations(complexId) {
    const where = {};
    if (complexId) {
      where.complex_id = complexId;
    }

    return await DAL.Find(stationMDL, {
      attributes: ["id", "station_type_id", "name"],
      raw: true,
      where: where,
      include: { model: stationTypeMDL, attributes: ["name", "assignment_minute_interval"] }
    });
  },

  async getAvailableStationsTypes(complexId) {
    if (isNullOrUndefinedOrEmpty(complexId)) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }
    const disabledStations = await getPermanentlyDisabledStations(complexId);
    try {
      const QUERY = `SELECT id, name 
                    FROM "StationType" stp 
                    WHERE EXISTS (SELECT null
                                  FROM "Station"
                                  WHERE station_type_id = stp.id
                                    AND complex_id = $complexId 
    ${disabledStations?.length > 0 ? `AND id NOT IN (${disabledStations})` : ""})`;

      const res = await sequelize.query(QUERY, {
        bind: { complexId },
        type: QueryTypes.SELECT
      });

      return res;
    } catch (err) {
      trackException(err, { name: "cant get available station types", complexId });

      throw err;
    }
  },

  async isValidStation(stationId, complexId) {
    if (isNullOrUndefinedOrEmpty(stationId)) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }

    const isExists = await DAL.FindOne(stationMDL, {
      raw: true,
      where: { id: stationId, ...(complexId && { complex_id: complexId }) }
    });

    return isExists !== null;
  },

  async updateStationById({ stationId, newDataObj, returning, transaction }) {
    if (isNullOrUndefinedOrEmpty(stationId) || isNotObject(newDataObj)) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }

    const [amountRecords, infoRecordsUpdated] = await DAL.Update(stationMDL, newDataObj, {
      returning,
      transaction,
      where: { id: stationId }
    });

    if (!amountRecords || !infoRecordsUpdated?.length) {
      throw new HttpError({ error: customResErrors.notFound });
    }

    return amountRecords === 1 ? infoRecordsUpdated[0] : { infoRecordsUpdated };
  },
  async handleDeleteDisables(deletedDisables, transaction) {
    if (deletedDisables?.length > 0) {
      await deleteDisables(deletedDisables, transaction);
    }
  },
  async handleCreateDisables(stationId, newDisables, transaction) {
    if (newDisables?.length > 0) {
      const stationData = await getStationById(stationId);

      const formattedData = newDisables.map(disable => {
        return {
          ...disable,
          station_id: stationId,
          complex_id: stationData.complex_id,
          station_type_id: stationData.station_type_id
        };
      });
      await createDisables(formattedData, transaction);

      const allStationDisables = [...(await getStationDisables(stationId)), ...formattedData];

      trackEvent("about to cancel appointments", { stationId });

      await require("./appointment").cancelAppointmentsByDisables({
        stationId,
        transaction,
        allStationDisables,
        statusId: appointmentStatuses.CANCELLED_BY_NON_ACTIVE_STATION
      });
    }
  },
  async setStationActivityById({ newDisables, deletedDisables, stationId }) {
    if (!(await this.isValidStation(stationId))) {
      throw new HttpError({ error: customResErrors.badRequest });
    }

    const transaction = await sequelize.transaction();
    try {
      await Promise.all([
        this.handleDeleteDisables(deletedDisables, transaction),
        this.handleCreateDisables(stationId, newDisables, transaction)
      ]);

      return await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      trackException(error, { name: "updating station activity failed" });
      throw error;
    }
  },

  async getStationsByTypeAndComplex(complexId, stationTypeId) {
    if (isNullOrUndefinedOrEmpty(complexId, stationTypeId)) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }

    return await DAL.Find(stationMDL, {
      attributes: ["id"],
      raw: true,
      where: { complex_id: complexId, station_type_id: stationTypeId }
    });
  }
};
