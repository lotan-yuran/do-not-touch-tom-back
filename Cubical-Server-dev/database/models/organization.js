'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Organization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Organization.hasMany(models.Complex, {
        foreignKey: "organization_id"
      })
    }
  };
  Organization.init({
    name: DataTypes.STRING
  }, {
    freezeTableName: true,
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    sequelize,
    modelName: 'Organization',
  });
  return Organization;
};