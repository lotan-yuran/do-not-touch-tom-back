const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers").appointment;
const responseHandler = require("../utilities").responseHandler;

// constants
const appointmentStatuses = require("../constants").appointmentStatuses;

router.post("/getUnavailableHours", (req, res) => {
  const { day, stationTypeId, complexId, appointmentUserId } = req.body;
  appointmentController
    .unavailableHoursAndIsUserMaxExceeded({ day, stationTypeId, complexId, userId: appointmentUserId })
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

router.post("/createAppointment", (req, res) => {
  const { userId, startDatetime, stationTypeId, complexId, userInfo, reason, stationId } = req.body;
  appointmentController
    .createAppointment({
      userId,
      startDatetime,
      stationTypeId,
      complexId,
      userInfo,
      reason,
      stationId
    })
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      console.log("err now");
      console.log(err.message);
      responseHandler.error(res, err, req);
    });
});

router.post("/getUserAppointments", (req, res) => {
  const { userId } = req.body;

  appointmentController
    .getUserAppointments(userId)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

router.post("/setAppointmentCancelledUser", (req, res) => {
  const { appointmentId, userId } = req.body;

  appointmentController
    .setAppointmentCancelled(appointmentId, userId, appointmentStatuses.CANCELLED_BY_USER)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

module.exports = router;
