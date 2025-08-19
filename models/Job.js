export default (db, DataTypes) => {
  const Job = db.define(
    "Job",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deadline: {
        type: DataTypes.DATE,
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
        allowNull: true,
      },
      requirements: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      skills: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      jobType: {
        type: DataTypes.ENUM([
          "full-time",
          "part-time",
          "contract",
          "remote",
          "internship",
        ]),
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM([
          "engineering",
          "marketing",
          "sales",
          "design",
          "hr",
          "it",
          "software_development",
          "data_science",
          "finance",
          "operations",
          "customer_support",
          "content_writing",
          "legal",
        ]),
        allowNull: false,
      },
      benefits: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      jobStatus: {
        type: DataTypes.ENUM(["open", "closed"]),
        allowNull: false,
        defaultValue: "open",
      },
      experience: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deletedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "jobs",
      timestamps: true,
    }
  );

  return Job;
};
