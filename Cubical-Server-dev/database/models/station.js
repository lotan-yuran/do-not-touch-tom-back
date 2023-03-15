"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Station extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Station.hasMany(models.DisabledStation, {
        foreignKey: "station_id",
        onDelete: "CASCADE"
      });

      Station.hasMany(models.Appointment, {
        foreignKey: "station_id",
        onDelete: "CASCADE"
      });

      Station.belongsTo(models.StationType, {
        foreignKey: "station_type_id"
      });

      Station.belongsTo(models.Complex, {
        foreignKey: "complex_id"
      });
    }
  }
  Station.init(
    {
      id: { allowNull: false, primaryKey: true, type: DataTypes.INTEGER },
      complex_id: DataTypes.INTEGER,
      station_type_id: DataTypes.INTEGER,
      is_active: DataTypes.BOOLEAN,
      name: DataTypes.STRING
    },
    {
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      sequelize,
      modelName: "Station"
    }
  );
  return Station;
};
