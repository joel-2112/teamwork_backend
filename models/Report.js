// models/Report.js

export default (sequelize, DataTypes) => {
  const Report = sequelize.define("Report", {
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

    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING), 
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("open", "in_progress", "resolved"),
      defaultValue: "open",
      allowNull: false,
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Report.associate = (models) => {
    Report.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "author",
    });
  };

  return Report;
};
