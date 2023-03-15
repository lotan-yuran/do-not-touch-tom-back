'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Appointment', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.STRING(9),
        references: {
          model: 'User', // name of Target model
          key: 'id', // key in Target model that we're referencing
        }
      },
      station_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Station', // name of Target model
          key: 'id', // key in Target model that we're referencing
        }
      },
      start_datetime: {
        type: Sequelize.DATE
      },
      end_datetime: {
        type: Sequelize.DATE
      },
      status_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'AppointmentStatus', // name of Target model
          key: 'id', // key in Target model that we're referencing
        }
      },
      sms_id: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Appointment');
  }
};