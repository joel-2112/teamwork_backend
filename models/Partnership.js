// models/Partnership.js
export default (db, DataTypes) => {
  const Partnership = db.define(
    "Partnership",
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
        type: DataTypes.ENUM(["male", "female", "other"]),
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
      abilityForPartnership: {
        type: DataTypes.ENUM([
          "idea",
          "tech_product",
          "budget_support",
          "other",
        ]),
        allowNull: false,
      },
      abilityDescription: {
        type: DataTypes.TEXT,
        allowNull: true, // stays true
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(["pending", "reviewed", "accepted", "rejected", "cancelled"]),
        allowNull: false,
        defaultValue: "pending",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users", // Assuming you have a Users model
          key: "id",
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deletedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users", // Assuming you have a Users model
          key: "id",
        },
      },
    },
    {
      tableName: "partnerships",
      timestamps: true,
      indexes: [
        { fields: ["email"] },
        { fields: ["status"] },
        { fields: ["abilityForPartnership"] },
      ],
    }
  );

  return Partnership;
};
