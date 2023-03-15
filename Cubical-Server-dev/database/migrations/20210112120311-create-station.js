'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "Station",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        complex_id: {
          type: Sequelize.INTEGER,
          references: {
            model: "Complex", // name of Target model
            key: "id" // key in Target model that we're referencing
          }
        },
        station_type_id: {
          type: Sequelize.INTEGER,
          references: {
            model: "StationType", // name of Target model
            key: "id" // key in Target model that we're referencing
          }
        },
        is_active: {
          type: Sequelize.BOOLEAN
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
        createdAt: "created_at",
        updatedAt: "updated_at"
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Station');
  }
};