"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "User",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.STRING(9)
        },
        first_name: {
          type: Sequelize.STRING(50)
        },
        last_name: {
          type: Sequelize.STRING(50)
        },
        phone: {
          type: Sequelize.STRING(10)
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
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("User");
  }
};
