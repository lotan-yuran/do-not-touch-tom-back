module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "Complex", // table name
      "phone", // new field name
      {
        type: Sequelize.STRING(10),
        allowNull: true
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // logic for reverting the changes
    await queryInterface.removeColumn("Complex", "phone");
  }
};
