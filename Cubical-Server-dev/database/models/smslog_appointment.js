"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SmsLog_Appointment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SmsLog_Appointment.belongsTo(models.SmsLog, {
        foreignKey: "sms_log_id"
      });

      SmsLog_Appointment.belongsTo(models.Appointment, {
        foreignKey: "appointment_id"
      });

      SmsLog_Appointment.belongsTo(models.AppointmentStatus, {
        foreignKey: "appointment_status_id"
      });
    }
  }
  SmsLog_Appointment.init(
    {
      sms_log_id: DataTypes.INTEGER,
      appointment_id: DataTypes.INTEGER,
      appointment_status_id: DataTypes.INTEGER
    },
    {
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      sequelize,
      modelName: "SmsLog_Appointment"
    }
  );
  return SmsLog_Appointment;
};
