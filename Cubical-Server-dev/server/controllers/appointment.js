// utils & helpers
const DAL = require("../DAL");
const moment = require("moment");
const momentTimeZone = require("moment-timezone");

const { Sequelize, QueryTypes, Op } = require("sequelize");
const { sequelize } = require("../../database/models");
const { isNullOrUndefinedOrEmpty, isNotObject } = require("../helpers");

// models
const stationMDL = require("../../database/models").Station;
const appointmentMDL = require("../../database/models").Appointment;
const userMDL = require("../../database/models").User;
const stationTypeMDL = require("../../database/models").StationType;
const complexMDL = require("../../database/models").Complex;
const disabledStationModel = require("../../database/models").DisabledStation;
const disableComplexModel = require("../../database/models").disabledComplex;

// controllers
const { getScheduleSettings } = require("./complex");
const { getAssignIntervalByStationType, getAvailableStation } = require("./station");
const { findOrCreateUserFromClick, getUserInfo } = require("./user");
const { getCurrentDisabledStations } = require("./disabledStation");
const { getCurrentDisabledStationsTimes } = require("./disabledStation");
const { trackEvent, trackException } = require("../utilities/logs");

// constants
const appointmentStatuses = require("../constants").appointmentStatuses;
const customResErrors = require("../constants").customError.customResErrors;
const MAX_POSSIBLE_APPOINTMENTS = parseInt(process.env.APPOINTMENT_MAX_USER_POSSIBLE_PER_DAY);

// utilities
const HttpError = require("../utilities").HttpError;
const AppointmentService = require("../utilities").AppointmentService;

const countAppointmentsByUserId = async ({ userId, day, complexId }) => {
  if (!userId) {
    throw new Error("Parameters validation failed");
  }

  const appointmentsFilter = [{ status_id: appointmentStatuses.ACTIVE }, { "user_info.id": userId }];
  const stationFilter = {};

  if (complexId) {
    stationFilter.complex_id = complexId;
  }
  if (day) {
    appointmentsFilter.push(
      Sequelize.where(Sequelize.literal("start_datetime::timestamp::date"), {
        [Op.eq]: moment(new Date(day)).format("MM-DD-YYYY")
      })
    );
  }

  return await DAL.Count(appointmentMDL, {
    raw: true,
    where: {
      [Op.and]: appointmentsFilter
    },
    include: [{ model: stationMDL, attributes: [], where: stationFilter }]
  });
};

/**
 * Get list of full capacity hours per day for specific complex and station type
 * @param   {String}  day           - specific day in datetime format
 * @param   {Number} stationTypeId  - station type
 * @param   {Number} complexId      - complex id
 * @returns {Array} - array hours in format 'HH:mm' - Israel timezone
 */
const getFullCapacityHoursPerDay = async ({ day, stationTypeId, complexId, stationId }) => {
  let where = { station_type_id: stationTypeId, complex_id: complexId };
  if (stationId) {
    where.id = stationId;
  }

  const potentialStations = stationId
    ? [{ id: stationId }]
    : await DAL.Find(stationMDL, {
        attributes: ["id"],
        where: { station_type_id: stationTypeId, complex_id: complexId }
      });

  if (!potentialStations) {
    throw new HttpError({ error: customResErrors.station.noStationMatch, params: { stationTypeId } });
  }
  const disabledStationsTimes = await getCurrentDisabledStationsTimes(
    complexId,
    stationTypeId,
    stationId,
    day,
    potentialStations.map(item => item.id)
  );

  //meetings in this complexid-stationType-day
  const fullCapacityDatetimes = await DAL.Find(stationMDL, {
    attributes: ["Appointments.start_datetime"],
    raw: true,
    where: where,
    group: ["Appointments.start_datetime", "Appointments.end_datetime"],
    include: [
      {
        model: appointmentMDL,
        attributes: [],
        where: {
          [Op.and]: [
            { status_id: appointmentStatuses.ACTIVE },
            Sequelize.where(Sequelize.literal("start_datetime::timestamp::date"), {
              [Op.eq]: moment(new Date(day)).format("MM-DD-YYYY")
            })
          ]
        }
      }
    ],
    having: Sequelize.where(Sequelize.fn("COUNT", Sequelize.col("*")), "=", potentialStations.length)
  });

  const fullCapacityDatetimesHours = fullCapacityDatetimes.map(item =>
    moment(item.start_datetime).utc().tz("Israel").format("HH:mm")
  );
  const disabledStationsHours = disabledStationsTimes.map(item =>
    moment(item).utc().tz("Israel").format("HH:mm")
  );
  const allBlockedTimes = [...fullCapacityDatetimesHours, ...disabledStationsHours];

  return allBlockedTimes;
};

const getAllDisablesStationPerDay = async ({ day, complexId }) => {
  let currentTime = moment(day).startOf("day");
  let beginTime = currentTime;
  let endTime = moment(day).endOf("day");
  let where = {
    ...(complexId && { complex_id: complexId }),
    end_date: { [Op.gt]: beginTime },
    start_date: { [Op.lte]: endTime }
  };

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
    const endDateComplexDisable = disabledComplex[0].end_date;
    const startDateComplexDisable = disabledComplex[0].start_date;

    const disableComplexId = disabledComplex.map(({ complex_id }) => complex_id);

    const disabledComplexStation = await DAL.Find(stationModel, {
      where: {
        ...(disabledComplex && { complex_id: disableComplexId })
      },
      attributes: ["id"],
      raw: true
    });

    const disabledComplexStationIds = disabledComplexStation.map(({ id }) => {
      return { id, start_date: startDateComplexDisable, end_date: endDateComplexDisable };
    });

    res = [...disabledStation, ...disabledComplexStationIds];
  } else {
    res = disabledStation;
  }
  trackEvent("getCurrentDisabledStations", { res });

  return res;
};

const getFullCapacityHoursPerDayForAdmin = async ({ day, stationId, complexId, stationTypeId }) => {
  const fullCapacityDatetimes = await DAL.Find(stationMDL, {
    raw: true,
    attributes: ["Appointments.start_datetime"],
    where: {
      id: stationId,
      station_type_id: stationTypeId,
      complex_id: complexId
    },
    include: [
      {
        model: appointmentMDL,
        attributes: [],
        where: {
          [Op.and]: [
            { status_id: appointmentStatuses.ACTIVE },
            Sequelize.where(Sequelize.literal("start_datetime::timestamp::date"), {
              [Op.eq]: moment(new Date(day)).format("MM-DD-YYYY")
            })
          ]
        }
      }
    ]
  });

  return fullCapacityDatetimes.map(item => moment(item.start_datetime).utc().tz("Israel").format("HH:mm"));
};

const unavailableUserHoursPerDay = async (userId, day) => {
  const userAppointments = await DAL.Find(appointmentMDL, {
    attributes: ["start_datetime"],
    raw: true,
    where: {
      [Op.and]: [
        { status_id: appointmentStatuses.ACTIVE },
        { "user_info.id": userId },
        Sequelize.where(Sequelize.literal("start_datetime::timestamp::date"), {
          [Op.eq]: moment(new Date(day)).format("MM-DD-YYYY")
        })
      ]
    }
  });

  return userAppointments.map(item => moment(item.start_datetime).utc().tz("Israel").format("HH:mm"));
};

const unavailableHoursByDayAndUser = async ({ userId, day, stationTypeId, complexId, stationId }) => {
  const fullCapacityHours = await getFullCapacityHoursPerDay({ day, stationTypeId, complexId, stationId });
  const userUnavailableHours = await unavailableUserHoursPerDay(userId, day);

  return [...new Set([...userUnavailableHours, ...fullCapacityHours])];
};

const unavailableHoursByDayAndUserForAdmin = async ({ userId, day, stationId, complexId, stationTypeId }) => {
  const [fullCapacityHours, userUnavailableHours] = await Promise.all([
    getFullCapacityHoursPerDayForAdmin({
      day,
      stationId,
      complexId,
      stationTypeId
    }),
    unavailableUserHoursPerDay(userId, day)
  ]);

  return [...new Set([...userUnavailableHours, ...fullCapacityHours])];
};

module.exports = {
  async unavailableHoursComplex({ day, complexId }) {
    if (!day || isNullOrUndefinedOrEmpty(complexId)) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }
    const returnedObj = { unavailableHours: null };
    const allDisabledSttionTimes = getAllDisablesStationPerDay({ day, complexId });
    return allDisabledSttionTimes;
  },
  async unavailableHoursAndIsUserMaxExceeded({ day, stationTypeId, complexId, userId, stationId }) {
    if (!day || isNullOrUndefinedOrEmpty(stationTypeId) || isNullOrUndefinedOrEmpty(complexId) || !userId) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }

    const appointment = new AppointmentService(appointmentMDL, userId);
    const { isMaxExceeded } = await appointment.checkUserReachedMaxAppointments({ userId, day, complexId });
    const returnedObj = { isMaxExceeded: false, unavailableHours: null };
    if (isMaxExceeded) {
      returnedObj.isMaxExceeded = true;
      returnedObj.maxPossibleAppointments = MAX_POSSIBLE_APPOINTMENTS;
    } else if (stationId) {
      returnedObj.unavailableHours = await unavailableHoursByDayAndUser({
        day,
        stationTypeId,
        complexId,
        userId,
        stationId
      });
    } else {
      returnedObj.unavailableHours = await unavailableHoursByDayAndUser({
        day,
        stationTypeId,
        complexId,
        userId
      });
    }

    trackEvent("unavailable hours", { returnedObj, function: "unavailableHoursAndIsUserMaxExceeded" });
    return returnedObj;
  },
  async getDisabledTimesByComplex({ complexId, day }) {
    const startDay = moment(day).startOf("day").format("YYYY-MM-DD HH:mm:ss");
    const endDay = moment(day).endOf("day").format("YYYY-MM-DD HH:mm:ss");

    const disabledComplexTimesThisDay = await DAL.Find(disableComplexModel, {
      attributes: ["start_date", "end_date", "complex_id"],
      raw: true,
      where: {
        complex_id: complexId,
        start_date: { [Op.lte]: endDay },
        end_date: { [Op.gte]: startDay }
      }
    });

    const stationPotential = await DAL.Find(stationMDL, {
      attributes: ["id"],
      raw: true,
      where: { complex_id: complexId }
    });
    //station disabled
    const disabledStationsTimesThisDay = await DAL.Find(disabledStationModel, {
      attributes: ["start_date", "end_date", "station_id"],
      raw: true,
      where: {
        complex_id: complexId,
        start_date: { [Op.lte]: endDay },
        end_date: { [Op.gte]: startDay }
      }
    });
    const formatDisabledStationsTimesThisDay = disabledStationsTimesThisDay.map(item => {
      return {
        station_id: item.station_id,
        start_date: moment(item.start_date).utc().tz("Israel").format("YYYY-MM-DD HH:mm:ss"),
        end_date: moment(item.end_date).utc().tz("Israel").format("YYYY-MM-DD HH:mm:ss")
      };
    });
    //complex disabled -> all stations disabled
    let stationDisabledBecauseComplexDisabled = [];
    disabledComplexTimesThisDay.forEach(item => {
      stationPotential.forEach(station => {
        stationDisabledBecauseComplexDisabled.push({
          station_id: station.id,
          start_date: moment(item.start_date).utc().tz("Israel").format("YYYY-MM-DD HH:mm:ss"),
          end_date: moment(item.end_date).utc().tz("Israel").format("YYYY-MM-DD HH:mm:ss")
        });
      });
    });
    const allDisablesTime = [...stationDisabledBecauseComplexDisabled, ...formatDisabledStationsTimesThisDay];

    return allDisablesTime;
  },
  async createAppointment({
    userId,
    startDatetime,
    stationTypeId,
    complexId,
    userInfo,
    stationId = null,
    reason
  }) {
    const { id } = userInfo;
    const appointment = new AppointmentService(appointmentMDL, userId, id);

    const startDatetimeList = [].concat(startDatetime);
    const { fullName, phone } = userId == userInfo.id ? await getUserInfo(id) : userInfo;

    await appointment.createAppointmentValidation({
      userId,
      startDatetimeList,
      stationTypeId,
      complexId,
      userInfo,
      stationId,
      reason,
      fullName,
      phone
    });

    // check that the startDateTime is valid by the complex schedule options and station interval
    const minuteInterval = await getAssignIntervalByStationType(stationTypeId);

    const startTimeArray = startDatetimeList.map(startDatetime => {
      return moment(startDatetime).seconds(0).milliseconds(0).toISOString();
    });

    // check the potential station to catch && the requested time is really available
    const stationForAllAppointments = await getAvailableStation({
      stationTypeId,
      complexId,
      appointmentDatetime: startTimeArray,
      stationId
    });

    const addedAppointments = [];
    const availableAppointments = [];
    const failedAppointments = [];

    for (const startDatetime of startDatetimeList) {
      const formattedStartDate = moment(startDatetime).seconds(0).milliseconds(0).toISOString();

      //check that the userId has no active appointment in that startDatetime already
      if (await appointment.isAppointmentExists(formattedStartDate)) {
        const ERROR = new HttpError({ error: customResErrors.appointment.appointmentExists });
        trackException(ERROR, {
          name: "appointment already exists",
          formattedStartDate,
          stationTypeId,
          userId,
          complexId
        });
        failedAppointments.push(startDatetime);

        continue;
      }

      const { weekdaysActivityTime, maxMonthsFromNow } = await getScheduleSettings(complexId);
      if (
        !appointment.isRequestedDatetimeValid(
          formattedStartDate,
          minuteInterval,
          weekdaysActivityTime,
          maxMonthsFromNow
        )
      ) {
        const ERROR = new HttpError({
          error: customResErrors.appointment.timeValidation,
          params: { startDatetime }
        });
        trackException(ERROR, {
          name: "request date time invalid",
          formattedStartDate,
          minuteInterval,
          weekdaysActivityTime,
          maxMonthsFromNow
        });

        failedAppointments.push(startDatetime);

        continue;
      }
      // check the potential station to catch && the requested time is really available
      const availableStation = stationForAllAppointments
        ? stationForAllAppointments
        : await getAvailableStation({
            stationTypeId,
            complexId,
            appointmentDatetime: [formattedStartDate],
            stationId
          });

      if (isNullOrUndefinedOrEmpty(availableStation)) {
        failedAppointments.push(startDatetime);
        const ERROR = new HttpError({ error: customResErrors.appointment.noAvailableStation });

        trackException(ERROR, {
          name: "non available station",
          userId,
          stationTypeId,
          complexId,
          startDatetime
        });

        continue;
      }

      // create the appointment with to service
      const end_datetime = moment(formattedStartDate).add({ minute: minuteInterval });

      const newAppointment = {
        userId,
        stationId: availableStation.id,
        start_datetime: formattedStartDate,
        end_datetime,
        userInfo: { id, fullName, phone },
        reason,
        stationTypeId,
        complexId
      };

      availableAppointments.push(newAppointment);
    }

    if (failedAppointments.length === 0) {
      await findOrCreateUserFromClick(userId);

      for (const newAppointment of availableAppointments) {
        const {
          status_id,
          user_info,
          station_id,
          end_datetime,
          start_datetime,
          id: appointmentId
        } = await appointment.createAppointment(newAppointment);
        addedAppointments.push({
          start_datetime,
          end_datetime,
          station_id
        });
      }
    }

    if (availableAppointments.length === 0 && failedAppointments.length > 0) {
      throw new HttpError({ error: customResErrors.appointment.noAvailableStation });
    }
    return { addedAppointments, failedAppointments, availableAppointments };
  },

  async getAllActiveAppointmentsByDay({ day, complexId }) {
    if (!day || isNullOrUndefinedOrEmpty(complexId)) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }

    const allAppointments = await DAL.Find(appointmentMDL, {
      attributes: [
        "id",
        "reason",
        "station_id",
        ["user_id", "userId"],
        ["start_datetime", "startDate"],
        ["end_datetime", "endDate"],
        ["user_info", "userInfo"]
      ],
      raw: true,
      where: {
        [Op.and]: [
          { status_id: appointmentStatuses.ACTIVE },
          Sequelize.where(Sequelize.literal("start_datetime::timestamp::date"), {
            [Op.eq]: moment(new Date(day)).format("MM-DD-YYYY")
          })
        ]
      },
      include: [
        { model: userMDL, attributes: [["first_name", "firstName"], ["last_name", "lastName"], "phone"] },
        {
          model: stationMDL,
          attributes: [],
          where: {
            complex_id: complexId
          }
        }
      ]
    });

    return allAppointments;
  },
  // get all user appointments : ordered for him or ordered by him.
  async getUserAppointments(userId) {
    if (!userId) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }

    const appointmentsFilter = [
      { status_id: appointmentStatuses.ACTIVE },
      { [Op.or]: [{ user_id: userId }, { user_info: { id: userId } }] }
    ];

    return await DAL.Find(appointmentMDL, {
      raw: true,
      where: { [Op.and]: appointmentsFilter },
      include: [
        {
          model: stationMDL,
          attributes: ["name"],
          include: [
            { model: stationTypeMDL, attributes: ["name"] },
            { model: complexMDL, attributes: ["name"] }
          ]
        }
      ],
      order: [["start_datetime", "DESC"]]
    });
  },

  async setAppointmentCancelled(appointmentId, userId, cancelledStatus) {
    if (isNullOrUndefinedOrEmpty(appointmentId)) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }

    const transaction = await sequelize.transaction();

    const where = { id: appointmentId, start_datetime: { [Op.gt]: new Date() } };

    if (cancelledStatus !== appointmentStatuses.CANCELLED_BY_ADMIN) {
      where.user_id = userId;
    }

    try {
      const [amountRecords, infoRecordsUpdated] = await DAL.Update(
        appointmentMDL,
        { status_id: cancelledStatus },
        {
          where,
          returning: true,
          transaction
        }
      );

      if (amountRecords === 0) {
        throw new HttpError({ error: customResErrors.notFound });
      } else {
        await transaction.commit();
        return infoRecordsUpdated;
      }
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async cancelAppointmentsByDisables({ stationId, statusId, allStationDisables, transaction }) {
    if (isNullOrUndefinedOrEmpty(stationId, statusId)) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }

    let disablesSql = {};
    allStationDisables.forEach(({ start_date: startDate, end_date: endDate }) => {
      disablesSql = { ...disablesSql, [Op.between]: [new Date(startDate), new Date(endDate)] };
    });

    const [amountRecords, infoRecordsUpdated] = await DAL.Update(
      appointmentMDL,
      { status_id: statusId },
      {
        transaction,
        returning: true,
        where: {
          station_id: stationId,
          status_id: appointmentStatuses.ACTIVE,
          start_datetime: disablesSql
        }
      }
    );

    return infoRecordsUpdated;
  },
  async deleteAppointments(listStationId, transaction) {
    return await DAL.Delete(appointmentMDL, {
      where: {
        station_id: { [Op.in]: listStationId },
        [Op.or]: { end_datetime: { [Op.lt]: new Date() }, status_id: { [Op.ne]: appointmentStatuses.ACTIVE } }
      },
      transaction
    });
  }
};
