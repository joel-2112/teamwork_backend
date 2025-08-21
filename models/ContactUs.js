import { ref } from "process";

// models/ContactUs.js
export default (db, DataTypes) => {
  const ContactUs = db.define(
    "ContactUs",
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Message cannot be empty",
          },
          len: {
            args: [10, 1000],
            msg: "Message must be between 10 and 1000 characters",
          },
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
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
      tableName: "contact_us",
      timestamps: true,
      indexes: [{ fields: ["email"] }],
    }
  );

  return ContactUs;
};
