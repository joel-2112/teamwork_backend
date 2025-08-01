// models/JobApplication.js
export default (db, DataTypes) => {
  const JobApplication = db.define(
    "JobApplication",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      status: {
        type: DataTypes.ENUM([
          "applied",
          "reviewed",
          "interviewed",
          "hired",
          "rejected",
        ]),
        allowNull: false,
        defaultValue: "applied",
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
          model: "jobs",
          key: "id",
        },
      },
      coverLetter: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resume: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        }
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      deletedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        }
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      }
    },
    {
      tableName: "job-applications",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["jobId", "applicantEmail"],
        },
      ],
    }
  );

  return JobApplication;
};
