'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Appointment", "sms_id");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "Appointment", // table name
      "sms_id", // new field name
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    )
  }
};
