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
const News = require('./News');
const Event = require('./Event');

const models = {
  Event,
  News,
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
Job.hasMany(JobApplication, { as: 'JobApplications', foreignKey: 'jobId', onDelete: 'CASCADE' });
JobApplication.belongsTo(Job, { foreignKey: 'jobId' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'RefreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'User' });

Zone.belongsTo(Region, { foreignKey: 'regionId' });
Region.hasMany(Zone, { foreignKey: 'regionId' });

Woreda.belongsTo(Zone, { foreignKey: 'zoneId' });
Zone.hasMany(Woreda, { foreignKey: 'zoneId' });

Agent.belongsTo(Woreda, { foreignKey: 'woredaId' });
Woreda.hasMany(Agent, { foreignKey: 'woredaId' });

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};