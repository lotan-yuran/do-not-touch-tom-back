"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "Complex_Admin",
      {
        user_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.STRING(9),
          references: {
            model: "User", // name of Target model
            key: "id" // key in Target model that we're referencing
          }
        },
        complex_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.INTEGER,
          references: {
            model: "Complex", // name of Target model
            key: "id" // key in Target model that we're referencing
          }
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      },
      {
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Complex_Admin");
  }
};
