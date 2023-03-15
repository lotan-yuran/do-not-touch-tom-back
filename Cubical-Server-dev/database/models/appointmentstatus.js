"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AppointmentStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AppointmentStatus.hasMany(models.Appointment, {
        foreignKey: "status_id",
        onDelete: "CASCADE"
      });
    }
  }
  AppointmentStatus.init(
    {
      name: DataTypes.STRING
    },
    {
      freezeTableName: true,
      underscored: true,
      sequelize,
      modelName: "AppointmentStatus"
    }
  );
  return AppointmentStatus;
};
