const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const JobApplication = sequelize.define('JobApplication', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM(['applied', 'interviewed', 'hired', 'rejected']),
    allowNull: false,
    defaultValue: 'applied',
  },
  applicantFullName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  applicantEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  applicantPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  applicantAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  applicantLinkedIn: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: { msg: 'Must be a valid URL' },
    },
  },
  applicantPortfolio: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: { msg: 'Must be a valid URL' },
    },
  },
  applicantExperience: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  applicantEducation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id',
    },
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resume: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: { msg: 'Must be a valid URL' },
    },
  },
}, {
  tableName: 'job-applications',
  timestamps: true,
});



module.exports = JobApplication;