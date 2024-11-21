
const Sequelize = require("sequelize");


const sequelize = new Sequelize("gjuwebdataconversion", "root", "root", {
  dialect: "mysql",
  host: "localhost",
  logging: false,
  timezone: "+05:30",
});

module.exports = sequelize;
