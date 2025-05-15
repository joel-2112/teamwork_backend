const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agent = sequelize.define('Agent', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [1, 100],
            notEmpty: true,
        },
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: true,
            notEmpty: true,
        },
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            len: [1, 20],
            notEmpty: true,
        },
    },
}, {
    timestamps: true,
    tableName: 'Agents',
});

module.exports = Agent;