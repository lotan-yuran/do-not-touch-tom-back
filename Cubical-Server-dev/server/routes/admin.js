const express = require("express");
const router = express.Router();

// controllers
const appointmentController = require("../controllers").appointment;
const complexController = require("../controllers").complex;
const stationController = require("../controllers").station;

// utils & services
const responseHandler = require("../utilities").responseHandler;
const { isNullOrUndefinedOrEmpty } = require("../helpers");
const { trackException } = require("../utilities/logs");
const HttpError = require("../utilities").HttpError;

// constants
const customResErrors = require("../constants").customError.customResErrors;
const appointmentStatuses = require("../constants").appointmentStatuses;

// user
router.post("/user/login", (req, res) => {
  responseHandler.json(res, { complexId: req.body.complexId });
});

// appointment
router.post("/appointment/getActiveAppointments", (req, res) => {
  const { day, complexId } = req.body;
  appointmentController
    .getAllActiveAppointmentsByDay({ day, complexId })
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

router.post("/appointment/getComplexUnavailableHours", (req, res) => {
  const { day, complexId } = req.body;
  appointmentController
    .getDisabledTimesByComplex({ day, complexId })
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});
router.post("/appointment/getUnavailableHours", (req, res) => {
  const { day, stationTypeId, complexId, appointmentUserId, stationId } = req.body;
  appointmentController
    .unavailableHoursAndIsUserMaxExceeded({
      day,
      complexId,
      stationId,
      stationTypeId,
      userId: appointmentUserId
    })
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

router.post("/appointment/setAppointmentCancelledAdmin", (req, res) => {
  const { appointmentId } = req.body;

  appointmentController
    .setAppointmentCancelled(appointmentId, req.body.userId, appointmentStatuses.CANCELLED_BY_ADMIN)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

// complexData
router.get("/complex/getData", async (req, res) => {
  complexController
    .getComplexData(req.query.complexId)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

router.put("/complex/updateComplexManagers", async (req, res) => {
  const { complexId, deletedManagersIds, addedManagers } = req.body;

  complexController
    .updateComplexManagers(complexId, deletedManagersIds, addedManagers)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

router.put("/complex/updateComplexDisables", async (req, res) => {
  const { complexId, deletedDisablesIds, addedDisables } = req.body;
  complexController
    .updateComplexDisables(complexId, deletedDisablesIds, addedDisables)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});
// complex
router.get("/complex/getSchedule", (req, res) => {
  complexController
    .getScheduleSettings(req.query.complexId)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

// station
router.get("/station/activeAvailableStationsTypes", (req, res) => {
  stationController
    .getAvailableStationsTypes(req.query.complexId, true)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

router.get("/station/availableStationsTypes", (req, res) => {
  stationController
    .getAvailableStationsTypes(req.query.complexId)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

router.get("/station/getAllStations", (req, res) => {
  stationController
    .getAllStations(req.query.complexId)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

router.post("/station/setStationActivity", (req, res) => {
  const { newDisables, deletedDisables, stationId } = req.body;
  stationController
    .setStationActivityById({ stationId, newDisables, deletedDisables })
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
      trackException(err, {
        name: "cant change station activity time",
        stationId,
        newDisables,
        deletedDisables
      });
    });
});

router.get("/station/stationsByType", (req, res) => {
  const { complexId, stationTypeId } = req.query;
  stationController
    .getStationsByTypeAndComplex(complexId, stationTypeId)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

module.exports = router;
