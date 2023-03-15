const express = require("express");
const router = express.Router();
const stationController = require("../controllers").station;
const responseHandler = require("../utilities").responseHandler;

router.get("/assignInterval", (req, res) => {
  stationController
    .getAssignIntervalByStationType(req.query.stationTypeId)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

router.get("/activeAvailableStationsTypes", (req, res) => {
  stationController
    .getAvailableStationsTypes(req.query.complexId, true)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

module.exports = router;
