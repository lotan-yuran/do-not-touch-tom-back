"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Appointment.belongsTo(models.User, {
        foreignKey: "user_id"
      });

      Appointment.belongsTo(models.AppointmentStatus, {
        foreignKey: "status_id"
      });

      Appointment.belongsTo(models.Station, {
        foreignKey: "station_id"
      });
    }
  }
  Appointment.init(
    {
      user_id: DataTypes.STRING,
      station_id: DataTypes.INTEGER,
      start_datetime: DataTypes.DATE,
      end_datetime: DataTypes.DATE,
      status_id: DataTypes.INTEGER,
      user_info: DataTypes.JSONB,
      reason: DataTypes.STRING,
      rating: DataTypes.INTEGER
    },
    {
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      sequelize,
      modelName: "Appointment"
    }
  );
  return Appointment;
};
