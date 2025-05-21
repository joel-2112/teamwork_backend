// models/Service.js
module.exports = (db, DataTypes) => {
  const Service = db.define('Service', {
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
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true, 
      },
    },
  }, {
    tableName: 'services',
    timestamps: true,
    indexes: [
      { fields: ['title'] },
    ],
  });

  return Service;
};