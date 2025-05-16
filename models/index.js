const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Job = require('./Job');
const JobApplication = require('./JobApplication');
const User = require('./User');
const RefreshToken = require('./RefreshToken');
const Agent = require('./Agent');
const Region = require('./Region');
const Zone = require('./Zone');
const Woreda = require('./Woreda');
const models = {
    Agent,
    Woreda,
    Region,
    Zone,
    Job,
    JobApplication,
    User,
    RefreshToken,
};

// Define associations

// Define the association between JobAppliction and Job
Job.hasMany(JobApplication, { as: 'JobApplications', foreignKey: 'jobId', onDelete: 'CASCADE' });
JobApplication.belongsTo(Job, { foreignKey: 'jobId', allowNull: false });
// Define the association between User and RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'RefreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'User', allowNull: false });
// Define the association between region and zone
Zone.belongsTo(Region, { foreignKey: 'regionId' });
Region.hasMany(Zone, { foreignKey: 'regionId' });
// Define the association between zone and Woreda
Woreda.belongsTo(Zone, { foreignKey: 'zoneId' });
Zone.hasMany(Woreda, { foreignKey: 'zoneId' });
// Define the association between Woreda and Agent
Agent.belongsTo(Woreda, { foreignKey: 'woredaId' });
Woreda.hasMany(Agent, { foreignKey: 'woredaId' });
module.exports = {
    sequelize,
    Sequelize,
    ...models,
};