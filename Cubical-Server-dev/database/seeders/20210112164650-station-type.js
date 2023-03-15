"use strict";
const StationTypeMDL = require("../models/index").StationTypeMDL;
const { getValuesToAdd, getValuesToUpdate, getValuesToDelete } = require("../seeder");
const TABLE_NAME = "StationType";
const DYNAMIC_FIELD = "name";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date().toISOString();
    const defaultValues = [
      { id: 1, name: "חדר דיונים", assignment_minute_interval: 60, created_at: now, updated_at: now },
      { id: 2, name: "משרד", assignment_minute_interval: 60, created_at: now, updated_at: now },
      { id: 3, name: "עמדת עבודה אישית", assignment_minute_interval: 60, created_at: now, updated_at: now },
      { id: 4, name: "עמדת עבודה בישיבה", assignment_minute_interval: 60, created_at: now, updated_at: now },
      { id: 5, name: "עמדת עבודה בעמידה", assignment_minute_interval: 60, created_at: now, updated_at: now },
      {
        id: 6,
        name: 'חד"ן (22 מקומות ישיבה)',
        assignment_minute_interval: 60,
        created_at: now,
        updated_at: now
      },
      { id: 7, name: 'חדר מג"ד', assignment_minute_interval: 60, created_at: now, updated_at: now }
    ];

    const existsValues = await queryInterface.select(StationTypeMDL, TABLE_NAME, {
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
