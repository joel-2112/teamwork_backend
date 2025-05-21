// migrations/20250521090400-create-customer-orders.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer_orders', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      regionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'regions',
          key: 'id',
        },
      },
      zoneId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'zones',
          key: 'id',
        },
      },
      woredaId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'woredas',
          key: 'id',
        },
      },
      manualRegion: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      manualZone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      manualWoreda: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sector: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      orderTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sex: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: false,
      },
      roleInSector: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phoneNumber1: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phoneNumber2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shortDescription: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      fileUpload: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
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

    await queryInterface.addIndex('customer_orders', ['country']);
    await queryInterface.addIndex('customer_orders', ['status']);
    await queryInterface.addIndex('customer_orders', ['regionId']);
    await queryInterface.addIndex('customer_orders', ['zoneId']);
    await queryInterface.addIndex('customer_orders', ['woredaId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer_orders');
  },
};