"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Resource extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Resource.hasMany(models.Station_Resource, {
        foreignKey: "resource_id",
        onDelete: "CASCADE"
      });
    }
  }
  Resource.init(
    {
      name: DataTypes.STRING
    },
    {
      freezeTableName: true,
      underscored: true,
      sequelize,
      modelName: "Resource"
    }
  );
  return Resource;
};
