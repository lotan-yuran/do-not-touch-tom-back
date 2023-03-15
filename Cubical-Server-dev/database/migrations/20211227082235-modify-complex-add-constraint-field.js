'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
        return Promise.all([
          queryInterface.addColumn('Complex', 'organization_id',
            {
              type: Sequelize.INTEGER,
              references: {
                model: 'Organization',
                key: 'id',
              },
              onUpdate: 'CASCADE',
              onDelete: 'SET NULL',
              defaultValue: null, after: 'can_maintain_system'
            }),
        ]);
      },

      down: (queryInterface, Sequelize) => {
        return Promise.all([
          queryInterface.removeColumn('Complex', 'organization_id'),
        ]);
      }
    };