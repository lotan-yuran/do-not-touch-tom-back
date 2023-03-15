const DAL = require("../DAL");
const sequelize = require("../../database/models").sequelize;
const stationModel = require("../../database/models").Station;
const appointmentMDL = require("../../database/models").Appointment;
const { QueryTypes } = require("sequelize");
const { trackEvent, trackException } = require("../utilities/logs");

const moment = require("moment");
const { Op } = require("sequelize");
const { disable } = require("../../app");
const appointmentStatuses = require("../constants").appointmentStatuses;

// helpers & utilities
const isNullOrUndefinedOrEmpty = require("../helpers").isNullOrUndefinedOrEmpty;
const HttpError = require("../utilities").HttpError;

// models
const complexMDL = require("../../database/models").Complex;
const stationMDL = require("../../database/models").Station;
const complexAdminMDL = require("../../database/models").Complex_Admin;
const disabledComplexMDL = require("../../database/models").disabledComplex;

// constants
const customResErrors = require("../constants").customError.customResErrors;

const deleteAppointments = async (complexId, addedDisablesToDb) => {
  const disabledComplexStation = await DAL.Find(stationModel, {
    where: {
      complex_id: complexId
    },
    attributes: ["id"],
    raw: true
  });
  let disablesSql = {};

  const disabledComplexStationIds = disabledComplexStation.map(({ id }) => id);

  addedDisablesToDb.forEach(({ start_date: startDate, end_date: endDate }) => {
    disablesSql = { ...disablesSql, [Op.between]: [new Date(startDate), new Date(endDate)] };
  });

  const [amountRecords, infoRecordsUpdated] = await DAL.Update(
    appointmentMDL,
    { status_id: appointmentStatuses.CANCELLED_BY_NON_ACTIVE_STATION },
    {
      returning: true,
      row: true,
      where: {
        station_id: disabledComplexStationIds,
        status_id: appointmentStatuses.ACTIVE,
        start_datetime: disablesSql
      }
    }
  );

  if (amountRecords > 0) {
    trackEvent("cancel appointments by station", {
      statusId: appointmentStatuses.CANCELLED_BY_NON_ACTIVE_STATION,
      canceled: amountRecords
    });
  }
};

module.exports = {
  async getScheduleSettings(complexId) {
    const DEFAULT_MAX_MONTH = 12;
    if (isNullOrUndefinedOrEmpty(complexId)) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }

    const complex = await DAL.FindOne(complexMDL, { raw: true, where: { id: complexId } });
    if (complex) {
      return {
        weekdaysActivityTime: complex.schedule,
        maxMonthsFromNow: parseInt(process.env.APPOINTMENT_MAX_MONTHS_FROM_NOW) || DEFAULT_MAX_MONTH
      };
    }
    return null;
  },

  async getComplexes(userId) {
    try {
      const userComplexes = await DAL.Find(complexAdminMDL, {
        attributes: ["user_id", "complex_id"],
        raw: true,
        where: { user_id: userId }
      });
      const userComplexIds = userComplexes.map(userComplex => userComplex?.complex_id) || [];

      if (userComplexIds?.length === 0) {
        return [];
      }

      const complexes = await sequelize.query(
        `SELECT id, name, phone
        FROM "Complex" allComp
        WHERE exists (SELECT null
                      FROM "Station"
                      WHERE complex_id = allComp.id
                        AND is_active = true)`,
        {
          type: QueryTypes.SELECT
        }
      );

      return complexes.filter(complex => userComplexIds.includes(complex.id));
    } catch (error) {
      trackException(error, { name: "cant get complexes" });
      throw error;
    }
  },
  async updateComplexManagers(complexId, deletedManagersIds, addedManagers) {
    try {
      if (deletedManagersIds?.length > 0) {
        const deleteFromDb = await DAL.Delete(complexAdminMDL, {
          where: {
            user_id: deletedManagersIds,
            complex_id: complexId
          }
        });
      }
      if (addedManagers?.length > 0) {
        const addedDisablesToDb = await DAL.BulkCreate(complexAdminMDL, addedManagers);
      }
    } catch (error) {
      trackException(error, { name: "cant update complex disables" });
      throw error;
    }
  },
  async updateComplexDisables(complexId, deletedDisablesIds, addedDisables) {
    try {
      if (deletedDisablesIds?.length > 0) {
        const deleteFromDb = await DAL.Delete(disabledComplexMDL, {
          where: {
            id: deletedDisablesIds
          }
        });
      }
      if (addedDisables?.length > 0) {
        const disabledComplex = addedDisables.map(disableComplex => {
          return {
            ...disableComplex,
            complex_id: complexId
          };
        });

        const addedDisablesToDb = await DAL.BulkCreate(disabledComplexMDL, disabledComplex);
        if (addedDisablesToDb?.length > 0) {
          await deleteAppointments(complexId, addedDisablesToDb);
        }
      }
    } catch (error) {
      trackException(error, { name: "cant update complex disables" });
      throw error;
    }
  },
  async getComplexData(complexId) {
    try {
      const complexData = await DAL.Find(complexMDL, {
        attributes: ["id", "name", "schedule", "phone", "waze_link"],
        raw: true,
        where: { id: complexId }
      });

      const complexeAdmins = await DAL.Find(complexAdminMDL, {
        attributes: ["user_id", "complex_id"],
        raw: true,
        where: { complex_id: complexId }
      });

      const complexDisable = await DAL.Find(disabledComplexMDL, {
        attributes: ["id", "complex_id", "title", "start_date", "end_date"],
        raw: true,
        where: {
          complex_id: complexId,
          end_date: { [Op.gte]: moment() }
        }
      });

      return { ...complexData[0], complexeAdmins, complexDisable };
    } catch (error) {
      trackException(error, { name: "cant get complex" });
      throw error;
    }
  },
  async getComplexesAndStations() {
    return await DAL.Find(complexMDL, { raw: false, include: { model: stationMDL, attributes: ["id"] } });
  }
};
