const express = require("express");
const router = express.Router();
const complexController = require("../controllers").complex;
const responseHandler = require("../utilities").responseHandler;

router.get("/complexCodes", (req, res) => {
  complexController
    .getComplexes(req?.user)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

router.get("/getSchedule", (req, res) => {
  complexController
    .getScheduleSettings(req.query.complexId)
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

module.exports = router;
