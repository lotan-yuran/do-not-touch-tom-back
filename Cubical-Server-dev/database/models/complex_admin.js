"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Complex_Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Complex_Admin.belongsTo(models.Complex, { foreignKey: "complex_id" });
    }
  }
  Complex_Admin.init(
    {
      user_id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      complex_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      }
    },
    {
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      sequelize,
      modelName: "Complex_Admin"
    }
  );
  return Complex_Admin;
};
