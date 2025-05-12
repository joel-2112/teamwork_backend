const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Your Sequelize instance

const RefreshToken = sequelize.define('RefreshToken', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id',
    },
  },
});

module.exports = RefreshToken;