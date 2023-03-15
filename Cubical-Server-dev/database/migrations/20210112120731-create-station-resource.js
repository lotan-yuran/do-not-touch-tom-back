'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Station_Resource', {
      station_id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Station', // name of Target model
          key: 'id', // key in Target model that we're referencing
        }
      },
      resource_id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Resource', // name of Target model
          key: 'id', // key in Target model that we're referencing
        }
      },
      is_resource_active: {
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Station_Resource');
  }
};