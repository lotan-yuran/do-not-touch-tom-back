'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SmsLog_Appointment', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sms_log_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "SmsLog", // name of Target model
          key: "id" // key in Target model that we're referencing
        }
      },
      appointment_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Appointment", // name of Target model
          key: "id" // key in Target model that we're referencing
        }
      },
      appointment_status_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "AppointmentStatus", // name of Target model
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
    },
    {
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at"
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SmsLog_Appointment');
  }
};