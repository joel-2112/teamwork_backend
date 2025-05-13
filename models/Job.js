//models/Job
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const User = require('./User');
const { date } = require('joi');

const Job = sequelize.define('Job', {   
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    duration:{
        type:DataTypes.DATE,
        allowNull: false,
    },
    deadline:{
        type:DataTypes.DATE,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    salary: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    requirements:{
        type: DataTypes.TEXT,
        allowNull: false,
    },
    skills:{
        type: DataTypes.TEXT,
        allowNull: false,
    },
    jobType:{
        type: DataTypes.ENUM['full-time', 'part-time', 'contract'],
        allowNull: false,
    },
    jobStatus:{
        type: DataTypes.ENUM['open', 'closed'],
        allowNull: false,
    },
    experience:{
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

    }, 
    {
    timestamps: true,
    });

Job.associate = (models) => {
  Job.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
//   Job.hasMany(models.JobApplication, { foreignKey: 'jobId', as: 'applications' });
};
module.exports = Job;
// This code defines a Job model using Sequelize ORM. The Job model has fields for title, description, location, salary, and company name. It also establishes a one-to-many relationship with the User model, indicating that a user can have multiple jobs associated with them.