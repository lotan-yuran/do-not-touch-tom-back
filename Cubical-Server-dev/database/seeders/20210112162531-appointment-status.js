"use strict";
const AppointmentStatusMDL = require("../models/index").AppointmentStatus;
const { getValuesToAdd, getValuesToUpdate, getValuesToDelete } = require("../seeder");
const TABLE_NAME = "AppointmentStatus";
const DYNAMIC_FIELD = "name";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const defaultValues = [
      { id: 1, name: `פעיל` },
      { id: 2, name: `בוטל ע"י המשתמש` },
      { id: 3, name: `בוטל עקב עמדה לא פעילה` },
      { id: 4, name: `בוטל ע"י מנהלן` }
    ];

    const existsValues = await queryInterface.select(AppointmentStatusMDL, TABLE_NAME, {
      raw: true
    });
    const valuesToAdd = getValuesToAdd(existsValues, defaultValues);
    const valuesToUpdate = getValuesToUpdate(existsValues, defaultValues, DYNAMIC_FIELD);
    const valuesToDelete = getValuesToDelete(existsValues, defaultValues);

    const seeds = [];
    valuesToAdd.length > 0 && seeds.push(queryInterface.bulkInsert(TABLE_NAME, valuesToAdd));
    valuesToUpdate.length > 0 &&
      seeds.concat(valuesToUpdate.map(item => queryInterface.bulkUpdate(TABLE_NAME, item, { id: item.id })));
    valuesToDelete.length > 0 && seeds.push(queryInterface.bulkDelete(TABLE_NAME, valuesToDelete));
    await Promise.all(seeds);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(TABLE_NAME, null, {});
  }
};
