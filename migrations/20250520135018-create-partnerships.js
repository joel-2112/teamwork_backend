// migrations/20250520160000-create-partnerships.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('partnerships', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sex: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: false,
      },
      profession: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      abilityForPartnership: {
        type: Sequelize.ENUM('idea', 'tech_product', 'budget_support', 'other'),
        allowNull: false,
      },
      abilityDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'reviewed', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('partnerships', ['email']);
    await queryInterface.addIndex('partnerships', ['status']);
    await queryInterface.addIndex('partnerships', ['abilityForPartnership']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('partnerships');
  },
};