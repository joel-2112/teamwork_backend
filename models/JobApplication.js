const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Job = require('./Job');

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
            isUrl: true,
        },
    },
    applicantPortfolio: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true,
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
            model: 'Jobs',
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
    },
    appliedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
    },
}, {
    timestamps: true,
});
// Export first to avoid circular dependency
module.exports = JobApplication;

