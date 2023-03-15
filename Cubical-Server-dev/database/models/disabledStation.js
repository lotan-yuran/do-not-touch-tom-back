"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DisabledStation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  DisabledStation.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      station_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "Station", // name of Target model
          key: "id" // key in Target model that we're referencing
        }
      },
      complex_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Complex", // name of Target model
          key: "id" // key in Target model that we're referencing
        }
      },
      station_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "StationType", // name of Target model
          key: "id" // key in Target model that we're referencing
        }
      },
      title: { type: DataTypes.STRING },
      start_date: { type: DataTypes.DATE, allowNull: false },
      end_date: { type: DataTypes.DATE, allowNull: false, defaultValue: null }
    },
    {
      freezeTableName: true,
      timestamps: false,
      underscored: true,
      sequelize,
      modelName: "DisabledStation"
    }
  );
  return DisabledStation;
};
