module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "Appointment", // table name
      "reason", // new field name
      {
        type: Sequelize.STRING(50),
        allowNull: true
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // logic for reverting the changes
    await queryInterface.removeColumn("Appointment", "reason");
  }
};
