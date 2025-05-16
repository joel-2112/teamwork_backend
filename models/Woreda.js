const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Zone = require('./Zone');

const Woreda = sequelize.define('Woreda', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  zoneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'zones',
      key: 'id',
    },
  },
}, {
  tableName: 'woredas',
  timestamps: false,
});

module.exports = Woreda;