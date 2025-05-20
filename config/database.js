// config/database.js
const { Sequelize } = require('sequelize');
const config = require('./config.json')[process.env.NODE_ENV || 'development'];

const db = new Sequelize({
  database: config.database,
  username: config.username,
  password: String(config.password), // Ensure password is a string
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  dialectOptions: config.dialectOptions,
  logging: config.logging ? console.log : false,
});

module.exports = db;