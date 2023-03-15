"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class StationType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StationType.hasMany(models.Station, {
        foreignKey: "station_type_id"
      });

      StationType.hasMany(models.DisabledStation, {
        foreignKey: "station_type_id"
      });
    }
  }
  StationType.init(
    {
      name: DataTypes.STRING,
      assignment_minute_interval: DataTypes.FLOAT
    },
    {
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      sequelize,
      modelName: "StationType"
    }
  );
  return StationType;
};
