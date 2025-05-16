const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Region = sequelize.define('Region', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'regions',
  timestamps: false,
});

module.exports = Region;