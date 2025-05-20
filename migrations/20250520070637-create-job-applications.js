'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('job-applications', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      status: {
        type: Sequelize.ENUM('applied', 'interviewed', 'hired', 'rejected'),
        allowNull: false,
        defaultValue: 'applied',
      },
      applicantFullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      applicantEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      applicantPhone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      applicantAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      applicantLinkedIn: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      applicantPortfolio: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      applicantExperience: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      applicantEducation: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      jobId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'jobs',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      coverLetter: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      resume: {
        type: Sequelize.STRING,
        allowNull: false,
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


  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('job-applications');
  },
};