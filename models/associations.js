// const sequelize = require('../config/database');
const Job = require('./Job');
const JobApplication = require('./JobApplication');

// job associations
JobApplication.belongsTo(Job, { foreignKey: 'jobId', allowNull: false });
Job.hasMany(JobApplication, { foreignKey: 'jobId' });

// module.exports = sequelize; // Optional: Export sequelize if needed