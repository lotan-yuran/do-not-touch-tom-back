if (process.env.MANUALLY_SEQ == "true") {
  require("dotenv").config();
}
module.exports = {
  development: {
    url: process.env.DATABASE_URL_DEV,
    dialect: "postgres",
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  test: {
    url: process.env.DATABASE_URL_TEST,
    dialect: "postgres",
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  localhost: {
    url: process.env.DATABASE_URL_LOCAL,
    dialect: "postgres"
  }
};
