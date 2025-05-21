module.exports = (db, DataTypes) => {
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
      },

      sex: {
        type: DataTypes.ENUM("Male", "Female", "Other"),
        allowNull: false,
      },
      profession: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      educationLevel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      agentType: {
        type: DataTypes.ENUM("Region", "Zone", "Woreda"),
        allowNull: false,
      },
      languages: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
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
    },
    {
      tableName: "agents",
      timestamps: true,
    }
  );
  return Agent;
};
