"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Delete_appointments_log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Delete_appointments_log.belongsTo(models.Complex, { foreignKey: "complex_id" });
    }
  }
  Delete_appointments_log.init(
    {
      amount_appointment: DataTypes.INTEGER,
      complex_id: DataTypes.INTEGER
    },
    {
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      sequelize,
      modelName: "Delete_appointments_log"
    }
  );
  return Delete_appointments_log;
};
