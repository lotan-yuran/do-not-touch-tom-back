"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  Team.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Organization", // name of Target model
          key: "id" // key in Target model that we're referencing
        }
      },
      name: { type: DataTypes.STRING }
    },
    {
      freezeTableName: true,
      timestamps: false,
      underscored: true,
      sequelize,
      modelName: "Team"
    }
  );

  Team.associate = function (models) {
    // associations can be defined here
    Team.hasMany(models.User, {
      foreignKey: "team_id",
      onDelete: "CASCADE"
    });
  };

  return Team;
};
