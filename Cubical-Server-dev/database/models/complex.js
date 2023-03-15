"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Complex extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Complex.hasMany(models.Station, {
        foreignKey: "complex_id"
      });

      Complex.hasMany(models.DisabledStation, {
        foreignKey: "complex_id"
      });

      Complex.hasMany(models.Complex_Admin, {
        foreignKey: "complex_id"
      });

      Complex.belongsTo(models.Organization, {
        foreignKey: "organization_id"
      });
    }
  }
  Complex.init(
    {
      name: DataTypes.STRING,
      organization_id: DataTypes.INTEGER,
      schedule: DataTypes.JSON,
      phone: DataTypes.STRING
    },
    {
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      sequelize,
      modelName: "Complex"
    }
  );
  return Complex;
};
