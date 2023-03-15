const express = require("express");
const router = express.Router();
const deleteAppointmentsController = require("../controllers").deleteAppointments;
const responseHandler = require("../utilities").responseHandler;

router.delete("/", (req, res) => {
  deleteAppointmentsController
    .deleteAppointments()
    .then(data => responseHandler.json(res, data))
    .catch(err => {
      responseHandler.error(res, err, req);
    });
});

module.exports = router;
