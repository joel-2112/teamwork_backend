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
          len: [2, 100],
        },
      },
      agentType: {
        type: DataTypes.ENUM(["Region", "Zone", "Woreda"]),
        allowNull: false,
      },
      agentStatus: {
        type: DataTypes.ENUM([ "pending", "reviewed", "accepted", "rejected"]),
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
        validate: {
          notEmpty: true,
          is: /^[0-9+\-\s]{9,15}$/,
        },
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
    },
    {
      tableName: "agents",
      timestamps: true,
    }
  );

  return Agent;
};
