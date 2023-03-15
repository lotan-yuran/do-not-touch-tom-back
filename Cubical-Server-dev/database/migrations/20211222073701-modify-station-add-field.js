module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "Station", // table name
      "name", // new field name
      {
        type: Sequelize.STRING(80),
        allowNull: true
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // logic for reverting the changes
    await queryInterface.removeColumn("Station", "name");
  }
};
