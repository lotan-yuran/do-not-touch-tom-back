// utils & helpers
const DAL = require("../DAL");
const { sequelize } = require("../../database/models");

// controllers
const sms = require("./sms");
const user = require("./user");
const complex = require("./complex");
const appointment = require("./appointment");

// models
const deleteAppointmentsLogMDL = require("../../database/models").Delete_appointments_log;

module.exports = {
  async deleteAppointments() {
    const transaction = await sequelize.transaction();
    try {
      const listComplex = await complex.getComplexesAndStations();

      const listDeleteAppointmentsLog = [];
      for (const complex of listComplex) {
        const amountAppointment = await appointment.deleteAppointments(
          complex.Stations.map(({ id }) => id),
          transaction
        );

        listDeleteAppointmentsLog.push({ amount_appointment: amountAppointment, complex_id: complex.id });
      }

      await Promise.all([
        DAL.BulkCreate(deleteAppointmentsLogMDL, listDeleteAppointmentsLog, { transaction }),
        user.deleteUsers(transaction)
      ]);

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
