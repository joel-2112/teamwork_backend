const { Sequelize } = require('sequelize');
const config = require('./config.json')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    logging: config.logging ? console.log : false,
});

module.exports = sequelize;