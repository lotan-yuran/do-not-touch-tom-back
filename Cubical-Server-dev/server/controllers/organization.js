const DAL = require("../DAL");
const { getCurrentDisabledStations } = require("./disabledStation");

// models
const complexMDL = require("../../database/models").Complex;
const stationMDL = require("../../database/models").Station;
const organizationMDL = require("../../database/models").Organization;

const { Op } = require("sequelize");

module.exports = {
  async getOrganizations() {
    return await DAL.Find(organizationMDL, {
      attributes: ["id", "name"],
      include: [
        {
          model: complexMDL,
          attributes: ["id", "name"],
          required: true,
          include: [
            {
              model: stationMDL,
              attributes: [],
              required: true
              // where: { id: { [Op.notIn]: disabledStations } }
            }
          ]
        }
      ]
    });
  }
};
