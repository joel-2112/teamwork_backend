// models/Service.js
export default (db, DataTypes) => {
  const Service = db.define(
    "Service",
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
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [10, 5000],
        },
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      videoUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      fileUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
      tableName: "services",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["title", "description",],
        },
      ],
    }
  );

  return Service;
};
