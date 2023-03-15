const express = require("express");
const router = express.Router();
const organizationController = require("../controllers").organization;
const responseHandler = require("../utilities").responseHandler;

router.get("/organizationCodes", (req, res) => {
  organizationController
    .getOrganizations()
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

module.exports = router;
