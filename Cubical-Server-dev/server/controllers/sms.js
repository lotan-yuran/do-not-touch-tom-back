const { createSMS } = require("../utilities/sms/index");
const { getStationTypeNameByStationId } = require("./station");
const { trackEvent } = require("../utilities/logs");
const { APPOINTMENT_CANCELED, APPOINTMENT_BY_ANOTHER } = require("../utilities/sms/smsType").smsTypes;

const smsForCancelledAppointments = async appointmentList => {
  for (const appointment of appointmentList) {
    const { name } = await getStationTypeNameByStationId(appointment.station_id);
    const [smsRecord] = await createSMS({
      toMobilePhone: appointment.user_info.phone,
      typeId: APPOINTMENT_CANCELED.id,
      text: APPOINTMENT_CANCELED.text({
        stationType: name,
        name: appointment.user_info.fullName,
        appointmentDatetime: appointment.start_datetime
      })
    });

    trackEvent("creating canceling appointment sms", {
      sms_log_id: smsRecord.id,
      appointment_id: appointment.id,
      appointment_status_id: appointment.status_id
    });
  }
};

const smsForCreateNewAppointmentByAnother = async ({
  user_info,
  start_datetime,
  userFullName,
  status_id,
  appointmentId,
  station_id
}) => {
  const { name } = await getStationTypeNameByStationId(station_id);
  const [smsRecord] = await createSMS({
    toMobilePhone: user_info.phone,
    typeId: APPOINTMENT_BY_ANOTHER.id,
    text: APPOINTMENT_BY_ANOTHER.text({
      userFullName,
      stationType: name,
      name: user_info.fullName,
      appointmentDatetime: start_datetime
    })
  });

  trackEvent("creating appointment sms", {
    sms_log_id: smsRecord.id,
    appointment_id: appointmentId,
    appointment_status_id: status_id
  });
};

const deleteSMSlogs = async transaction => {
  await DAL.Delete(SmsLog_AppointmentMDL, {
    where: {
      sms_log_id: {
        [Op.in]: Sequelize.literal(`(SELECT "id" FROM "SmsLog" WHERE "status_code" = ${SMS_SENT})`)
      }
    },
    transaction
  });
  await DAL.Delete(SmsLogMDL, { where: { status_code: SMS_SENT }, transaction });
};

module.exports = { smsForCancelledAppointments, smsForCreateNewAppointmentByAnother, deleteSMSlogs };
