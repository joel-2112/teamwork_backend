// models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
  },
}, {
  timestamps: true,
});

// Instance method to compare passwords
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = User;
