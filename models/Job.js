const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  salary: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      isFloat: { min: 0 },
    },
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  jobType: {
    type: DataTypes.ENUM(['full-time', 'part-time', 'contract', 'remote', 'internship']),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM(['engineering', 'marketing', 'sales', 'design', 'hr']),
    allowNull: false,
  },
  benefits: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  jobStatus: {
    type: DataTypes.ENUM(['open', 'closed']),
    allowNull: false,
    defaultValue: 'open',
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
}, {
  tableName: 'jobs',
  timestamps: true,
});



module.exports = Job;