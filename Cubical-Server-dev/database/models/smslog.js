"use strict";
// const Sequelize = require("sequelize");
// const db = DAL.db;

module.exports = (sequelize, DataTypes) => {
  const SmsLog = sequelize.define(
    "SmsLog",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      phone: {
        allowNull: false,
        type: DataTypes.STRING(10)
      },
      sms_type_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      text: {
        allowNull: false,
        type: DataTypes.STRING
      },
      sent_at: {
        type: DataTypes.DATE
      },
      status_code: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      sms_error_desc: {
        type: DataTypes.STRING(50)
      }
    },
    {
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  );

  SmsLog.associate = models => {
    SmsLog.hasMany(models.SmsLog_Appointment, {
      foreignKey: "sms_log_id"
    });
  };

  return SmsLog;
};
