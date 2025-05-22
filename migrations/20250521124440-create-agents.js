'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agents', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100]
        }
      },
      sex: {
        type: Sequelize.ENUM('Male', 'Female', 'Other'),
        allowNull: false
      },
      profession: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100]
        }
      },
      educationLevel: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100]
        }
      },
      agentType: {
        type: Sequelize.ENUM('Region', 'Zone', 'Woreda'),
        allowNull: false
      },
      languages: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          is: /^[0-9+\-\s]{9,15}$/
        }
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      regionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'regions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      zoneId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'zones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      woredaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'woredas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('agents', ['phoneNumber'], { unique: true });
    await queryInterface.addIndex('agents', ['email'], { unique: true });
    await queryInterface.addIndex('agents', ['regionId']);
    await queryInterface.addIndex('agents', ['zoneId']);
    await queryInterface.addIndex('agents', ['woredaId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('agents');
  }
};