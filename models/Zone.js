const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Region = require('./Region');

const Zone = sequelize.define('Zone', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  regionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'regions',
      key: 'id',
    },
  },
}, {
  tableName: 'zones',
  timestamps: false,
});


module.exports = Zone;