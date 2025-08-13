export default (db, DataTypes) => {
  const Agent = db.define(
    "Agent",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      sex: {
        type: DataTypes.ENUM("Male", "Female", "Other"),
        allowNull: false,
      },
      profession: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      educationLevel: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 1000],
        },
      },
      agentType: {
        type: DataTypes.ENUM(["Region", "Zone", "Woreda"]),
        allowNull: false,
      },
      agentStatus: {
        type: DataTypes.ENUM([
          "pending",
          "reviewed",
          "accepted",
          "rejected",
          "cancelled",
        ]),
        allowNull: false,
        defaultValue: "pending",
      },
      languages: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "At least one language is required",
          },
          isArray(value) {
            if (!Array.isArray(value) || value.length === 0) {
              throw new Error("Languages must be a non-empty array");
            }
          },
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      regionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "regions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      zoneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "zones",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      woredaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "woredas",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userId: {
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
      tableName: "agents",
      timestamps: true,
    }
  );

  return Agent;
};
