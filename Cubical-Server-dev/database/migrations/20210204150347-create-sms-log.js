const { sequelize } = require("../models");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "SmsLog",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        phone: {
          allowNull: false,
          type: Sequelize.STRING(10)
        },
        sms_type_id: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        text: {
          allowNull: false,
          type: Sequelize.STRING
        },
        sent_at: {
          type: Sequelize.DATE
        },
        status_code: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        sms_error_desc: {
          type: Sequelize.STRING(50)
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
    await queryInterface.dropTable("SmsLog");
  }
};
