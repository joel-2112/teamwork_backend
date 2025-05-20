// models/JobApplication.js
module.exports = (db, DataTypes) => {
  const JobApplication = db.define('JobApplication', {
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
    },
    applicantPortfolio: {
      type: DataTypes.STRING,
      allowNull: true,
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
        model: 'jobs',
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
  }, {
    tableName: 'job-applications',
    timestamps: true,
    indexes: [
      { fields: ['jobId'] },
      { fields: ['status'] },
    ],
  });

  return JobApplication;
};