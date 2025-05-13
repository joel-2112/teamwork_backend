//models/JobApplication

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Job = require('./Job');

const JobApplication = sequelize.define('JobApplication', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    status: {
        type: DataTypes.ENUM('applied', 'interviewed', 'hired', 'rejected'),
        allowNull: false,
    },
    coverLetter: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    resume: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Job,
            key: 'id',
        },
    },
});

// Define the relationships
User.hasMany(JobApplication, { foreignKey: 'userId', as: 'jobApplications' });
Job.hasMany(JobApplication, { foreignKey: 'jobId', as: 'jobApplications' });
JobApplication.belongsTo(User, { foreignKey: 'userId', as: 'user' });
JobApplication.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
