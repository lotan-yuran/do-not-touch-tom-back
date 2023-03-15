"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "StationType",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING(50)
        },
        description: {
          type: Sequelize.STRING
        },
        assignment_minute_interval: {
          type: Sequelize.FLOAT
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      },
      {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("StationType");
  }
};
