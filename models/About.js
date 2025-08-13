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
        },
      },
      aboutImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      mission: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      vision: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      values: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          notEmpty: true,
          isValidValuesArray(value) {
            if (!Array.isArray(value) || value.length === 0) {
              throw new Error("Values must be a non-empty array");
            }

            value.forEach((item, index) => {
              if (
                typeof item !== "object" ||
                !item.title ||
                !item.description ||
                typeof item.title !== "string" ||
                typeof item.description !== "string" ||
                item.title.trim().length < 3 ||
                item.description.trim().length < 5
              ) {
                throw new Error(
                  `Each value must be an object with a valid 'title' (min 3 chars) and 'description' (min 5 chars). Error at index ${index}`
                );
              }
            });
          },
        },
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
      tableName: "abouts",
      timestamps: true,
      indexes: [{ fields: ["title"] }],
    }
  );

  return About;
};
