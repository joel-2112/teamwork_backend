// models/About.js
export default (db, DataTypes) => {
  const About = db.define(
    "About",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 100],
        },
      },
      aboutImage: {
        type: DataTypes.STRING,
        allowNull: true,
        // validate: {
        //   isUrl: true, // Assumes image is stored as a URL
        // },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [10, 5000],
        },
      },
      mission: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [10, 1000],
        },
      },
      vision: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [10, 1000],
        },
      },
      values: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          notEmpty: true,
          isValidArray(value) {
            if (!Array.isArray(value) || value.length === 0) {
              throw new Error("Values must be a non-empty array");
            }
          },
        },
      },
    },
    {
      tableName: "abouts",
      timestamps: true,
      indexes: [{ fields: ["title"] }],
    }
  );

  return About;
};
