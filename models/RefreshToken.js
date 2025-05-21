// models/RefreshToken.js
const { DataTypes } = require('sequelize');

module.exports = (db, DataTypes) => {
  const RefreshToken = db.define('RefreshToken', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(512), // Increased length for JWT
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [100, 512], // Enforce JWT length
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    tableName: 'refresh-tokens',
    timestamps: true,
    paranoid: true, // Enable soft deletes
    hooks: {
      // Optional: Clean up old tokens for the same user on create
      beforeCreate: async (token, options) => {
        await RefreshToken.destroy({
          where: {
            userId: token.userId,
          },
          transaction: options.transaction,
        });
      },
    },
  });


  return RefreshToken;
};