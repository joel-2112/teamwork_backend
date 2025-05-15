const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Job = require('./Job');
const JobApplication = require('./JobApplication');
const User = require('./User');
const RefreshToken = require('./RefreshToken');

const models = {
    Agent,
    Job,
    JobApplication,
    User,
    RefreshToken,
};

// Define associations
Job.hasMany(JobApplication, { as: 'JobApplications', foreignKey: 'jobId', onDelete: 'CASCADE' });
JobApplication.belongsTo(Job, { foreignKey: 'jobId', allowNull: false });
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'RefreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'User', allowNull: false });

module.exports = {
    sequelize,
    Sequelize,
    ...models,
};