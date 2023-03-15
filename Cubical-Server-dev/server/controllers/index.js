const user = require("./user");
const complex = require("./complex");
const station = require("./station");
const disabledStation = require("./disabledStation");
const appointment = require("./appointment");
const organization = require("./organization");
const deleteAppointments = require("./deleteAppointments");

module.exports = {
  user,
  station,
  disabledStation,
  complex,
  appointment,
  organization,
  deleteAppointments
};
