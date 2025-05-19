'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_applications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('job_applications', ['applicantEmail', 'jobId'], {
      unique: true,
      name: 'unique_email_per_job',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('job_applications');
  },
};