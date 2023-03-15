"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING(9)
      },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      phone: DataTypes.STRING
    },
    {
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  );
  User.associate = function (models) {
    // associations can be defined here
    User.hasMany(models.Appointment, {
      foreignKey: "user_id",
      onDelete: "CASCADE"
    });
  };
  return User;
};
