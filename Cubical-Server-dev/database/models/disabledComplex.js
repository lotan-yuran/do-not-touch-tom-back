"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class disabledComplex extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  disabledComplex.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      complex_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Complex", // name of Target model
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
      modelName: "disabledComplex"
    }
  );

  return disabledComplex;
};
