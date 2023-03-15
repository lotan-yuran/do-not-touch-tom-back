"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("Complex_Admin", "Complex_Admin_user_id_fkey");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint("Complex_Admin", {
      type: "foreign key",
      fields: ["status_id"],
      name: "Complex_Admin_user_id_fkey",
      references: {
        table: "User",
        field: "id"
      }
    });
  }
};
