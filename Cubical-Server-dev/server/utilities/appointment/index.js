const DAL = require("../../DAL");
const appointmentStatuses = require("../../constants").appointmentStatuses;
const moment = require("moment");
const { validateUserInfo, validateUser } = require("../../validation");

const { isNullOrUndefinedOrEmpty, isNotObject } = require("../../helpers");
const HttpError = require("../../utilities").HttpError;

// Helpers
const MAX_POSSIBLE_APPOINTMENTS = parseInt(process.env.APPOINTMENT_MAX_USER_POSSIBLE_PER_DAY);

const getHour = (minutesExist, newMinutes) =>
  Number.parseInt((Number(minutesExist) + Number(newMinutes)) / 60);
const getMinute = (minutesExist, newMinutes) =>
  Number.parseInt((Number(minutesExist) + Number(newMinutes)) % 60);

const buildTimeFramesArr = (startHour, endHour, intervalTime) => {
  const arrayHours = [];
  const [endH, endM] = endHour.split(":");
  let [startH, startM] = startHour.split(":");
  while (Number(endH) > Number(startH) || Number(endM) > Number(startM)) {
    arrayHours.push(`${startH}:${startM}`);
    startH = (Number(startH) + getHour(startM, intervalTime)).toString().padStart(2, 0);
    startM = getMinute(startM, intervalTime).toString().padStart(2, 0);
  }
  return arrayHours;
};
module.exports = class AppointmentService {
  constructor(DBmodel, userId, appointmentUserId) {
    this.DBmodel = DBmodel;
    this.userId = userId;
    this.appointmentUserId = appointmentUserId;
  }

  async checkUserReachedMaxAppointments({ userId, day, complexId }) {
    const data = { isMaxExceeded: false, userAppointmentCount: null };

    // if there is no limit, return false=OK
    if (!MAX_POSSIBLE_APPOINTMENTS) {
      return data;
    }
    const countAppointments = await countAppointmentsByUserId({
      userId,
      day,
      complexId
    });
    data.userAppointmentCount = countAppointments;
    if (countAppointments >= MAX_POSSIBLE_APPOINTMENTS) {
      data.isMaxExceeded = true;
    }

    return data;
  }

  async createAppointmentValidation({
    userId,
    startDatetimeList,
    stationTypeId,
    complexId,
    userInfo,
    stationId,
    reason,
    fullName,
    phone
  }) {
    const { id } = userId;
    if (
      !userId ||
      !startDatetimeList?.length ||
      isNullOrUndefinedOrEmpty(stationTypeId, complexId) ||
      isNotObject(userInfo)
    ) {
      throw new HttpError({ error: customResErrors.parametersValidation });
    }
    // validate user
    await validateUser(userId);
    // validate userInfo appointment created for
    validateUserInfo({ userId: id, fullName, phone });
    // check appointments count for that complexId and day
    const MAX_POSSIBLE_APPOINTMENTS = parseInt(process.env.APPOINTMENT_MAX_USER_POSSIBLE_PER_DAY);
    const { isMaxExceeded, userAppointmentCount } = await this.checkUserReachedMaxAppointments({
      userId: id,
      day: moment(new Date(startDatetimeList[0])).format("MM-DD-YYYY"),
      complexId
    });
    if (
      isMaxExceeded ||
      (userAppointmentCount && MAX_POSSIBLE_APPOINTMENTS - userAppointmentCount < startDatetimeList.length)
    ) {
      throw new HttpError({
        error: customResErrors.appointment.exceededMaxAppointments,
        params: {
          userId: id,
          day: moment(new Date(startDatetimeList[0])).format("MM-DD-YYYY"),
          complexId,
          maxPossibleAppointments: MAX_POSSIBLE_APPOINTMENTS
        }
      });
    }
  }

  async createAppointment({ stationId, start_datetime, end_datetime, transaction, userInfo = null, reason }) {
    if (!this.DBmodel || !this.userId || !start_datetime || !end_datetime) {
      throw new Error("Parameters validation failed");
    }

    const newAppointment = await DAL.Create(
      this.DBmodel,
      {
        user_id: this.userId,
        start_datetime,
        end_datetime,
        station_id: stationId,
        reason,
        status_id: appointmentStatuses.ACTIVE,
        user_info: userInfo
      },
      { transaction: transaction }
    );

    return newAppointment;
  }

  async isAppointmentExists(startDatetime, transaction) {
    const foundAppointment = await DAL.FindOne(this.DBmodel, {
      raw: true,
      where: {
        "user_info.id": this.appointmentUserId,
        start_datetime: startDatetime,
        status_id: appointmentStatuses.ACTIVE
      },
      transaction: transaction
    });

    return foundAppointment !== null;
  }

  isRequestedDatetimeValid(appointmentDatetime, minuteInterval, activityTimes, appointmentMaxMonthsFromNow) {
    const currentDate = moment(new Date()).utc().tz("Israel");
    const localAppointmentDatetime = moment(appointmentDatetime)
      .set({ second: 0, millisecond: 0 })
      .utc()
      .tz("Israel");

    if (appointmentMaxMonthsFromNow) {
      // compare date only, without time
      const appointmentDateToCompare = localAppointmentDatetime.format("L");
      const currDateToCompare = currentDate.format("L");

      const monthDiff = moment(appointmentDateToCompare).diff(currDateToCompare, "months", true);
      if (monthDiff > appointmentMaxMonthsFromNow) {
        return false;
      }
    }
    const dayOfWeek = localAppointmentDatetime.day();

    if (!activityTimes[dayOfWeek]) {
      return false;
    }

    const [startH, startM] = activityTimes[dayOfWeek].startHour.split(":");
    const [endH, endM] = activityTimes[dayOfWeek].endHour.split(":");
    const minOptionalDate = moment(appointmentDatetime).utc().tz("Israel").set({
      hour: startH,
      minute: startM,
      second: 0,
      millisecond: 0
    });
    const maxOptionalDate = moment(appointmentDatetime)
      .utc()
      .tz("Israel")
      .set({ hour: endH, minute: endM, second: 0, millisecond: 0 })
      .subtract(minuteInterval, "minute");

    const timeFramesList = buildTimeFramesArr(
      activityTimes[dayOfWeek].startHour,
      activityTimes[dayOfWeek].endHour,
      minuteInterval
    );

    const requestedTime = moment(appointmentDatetime).utc().tz("Israel").format("HH:mm");

    // check valid interval && valid curr time && valid by schedule options
    if (
      !localAppointmentDatetime.isBetween(minOptionalDate, maxOptionalDate, undefined, "[]") ||
      localAppointmentDatetime.isBefore(currentDate) ||
      !timeFramesList.includes(requestedTime)
    ) {
      return false;
    }

    return true;
  }
};
