"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn("Appointment", "created_by"),

      queryInterface.addColumn(
        "Appointment", // table name
        "user_info", // new field name
        {
          type: Sequelize.JSONB,
          allowNull: true
        }
      )
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn(
        "Appointment", // table name
        "created_by", // new field name
        {
          type: Sequelize.STRING(9),
          allowNull: true
        }
      ),
      queryInterface.removeColumn("Appointment", "user_info")
    ]);
  }
};
