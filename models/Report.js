
// models/Report.js
export default (db, DataTypes) => {
  const Report = db.define(
    "Report",
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
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      videoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fileUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      regionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "regions",
          key: "id",
        },
      },
      zoneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "zones",
          key: "id",
        },
      },
      woredaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "woredas",
          key: "id",
        },
      },
      category: {
        type: DataTypes.ENUM([
          "infrastructure",
          "security",
          "health",
          "education",
          "environment",
          "transport",
          "emergency",
          "other",
        ]),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "open",
          "in_progress",
          "cancelled",
          "resolved"
        ),
        defaultValue: "pending",
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      statusChangedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      changedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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
      tableName: "reports",
      timestamps: true,
    }
  );

  return Report;
};
