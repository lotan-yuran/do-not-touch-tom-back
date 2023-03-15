'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Station_Resource extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Station_Resource.belongsTo(models.Resource, {
        foreignKey: 'resource_id',
      });
      Station_Resource.belongsTo(models.Station, {
        foreignKey: 'station_id',
      });
    }
  };
  Station_Resource.init({
    station_id: DataTypes.INTEGER,
    resource_id: DataTypes.INTEGER,
    is_resource_active: DataTypes.BOOLEAN
  }, {
    freezeTableName: true,
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    sequelize,
    modelName: 'Station_Resource',
  });
  return Station_Resource;
};