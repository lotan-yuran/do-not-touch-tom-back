"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const envConfigs = require("../config/config");
const chalk = require("chalk");
const { setHealth } = require("../../server/utilities").health;

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = envConfigs[env];
const db = {};

let sequelize;

if (config.url) {
  sequelize = new Sequelize(config.url, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

console.log(chalk.bgBlack.bold.blue(`[Database] server - ${JSON.stringify(envConfigs[env].url)} on ${env}`));


sequelize
  .authenticate()
  .then(() => {
    console.log(chalk.bgBlack.bold.blue(`[Database] Connection established`));
    setHealth("db", true);
  })
  .catch(err => {
    console.error(chalk.bgBlack.bold.blue(`[Database] Connection failed: ${err.message}`));
    // db.close();
  });

fs.readdirSync(__dirname)
  .filter(file => {
    return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
