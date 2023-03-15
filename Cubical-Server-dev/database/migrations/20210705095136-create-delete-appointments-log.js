'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Delete_appointments_log", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amount_appointment: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      complex_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Complex", // name of Target model
          key: "id" // key in Target model that we're referencing
        }
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Delete_appointments_log");
  }
};