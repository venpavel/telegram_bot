const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Country = sequelize.define(
  "country",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING, unique: true },
    capital: { type: DataTypes.STRING },
    continent: { type: DataTypes.STRING },
    code: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

module.exports = Country;
