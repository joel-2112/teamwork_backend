// config/database.js
const { Sequelize } = require('sequelize');
const config = require('./config.json')[process.env.NODE_ENV || 'development'];
//database
const db = new Sequelize({
  database: config.database,
  username: config.username,
  password: String(config.password), 
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  dialectOptions: config.dialectOptions,
  logging: config.logging ? console.log : false,
});

module.exports = db;