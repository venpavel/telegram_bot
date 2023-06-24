const { Sequelize } = require("sequelize");

module.exports = new Sequelize("telega_bot", "postgres", "123456", {
  host: "localhost",
  port: "5432",
  dialect: "postgres",
});
