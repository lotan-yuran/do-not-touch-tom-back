module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "Appointment", // table name
      "created_by", // new field name
      {
        type: Sequelize.STRING(9),
        allowNull: true
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // logic for reverting the changes
    await queryInterface.removeColumn("Appointment", "created_by");
  }
};
