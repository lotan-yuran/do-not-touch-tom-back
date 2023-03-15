const express = require("express");
const router = express.Router();
const disabledStation = require("../controllers/disabledStation");
const { trackException, trackEvent } = require("../utilities/logs");
const { genericError } = require("../utilities/httpError/genericError");

router.get("/current", async (req, res) => {
  try {
    res.json(await disabledStation.getCurrentDisabledStations());
  } catch (err) {
    trackException(err, { name: "cant get current disabled stations" });
    genericError(res, err);
  }
});

router.get("/:stationId", async (req, res) => {
  try {
    res.json(await disabledStation.getStationDisables(req.params.stationId));
  } catch (err) {
    trackException(err, { name: "cant get station disables", stationId: req.params.stationId });
    genericError(res, err);
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.body) {
      throw new Error();
    }

    trackEvent("new disables data -route", req.body);

    res.json(await disabledStation.createDisables(req.body));
  } catch (err) {
    trackException(err, { name: "cant create disables", disables: req.body });
    genericError(res, err);
  }
});

router.delete("/", async (req, res) => {
  try {
    res.json(await disabledStation.deleteDisables(req.body));
  } catch (err) {
    trackException(err, { name: "cant delete disables", disables: req.body });
    genericError(res, err);
  }
});

module.exports = router;
