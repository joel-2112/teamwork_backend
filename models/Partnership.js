// models/Partnership.js
module.exports = (db, DataTypes) => {
  const Partnership = db.define('Partnership', {
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
      type: DataTypes.ENUM(['male', 'female', 'other']),
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
      type: DataTypes.ENUM(['idea', 'tech_product', 'budget_support', 'other']),
      allowNull: false,
    },
    abilityDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        notEmpty: {
          msg: 'Description is required when abilityForPartnership is "other"',
          when: (partnership) => partnership.abilityForPartnership === 'other',
        },
      },
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
      validate: {
        is: /^\+?[\d\s-]{10,}$/i, // Basic phone number validation
      },
    },
    status: {
      type: DataTypes.ENUM(['pending', 'reviewed', 'accepted', 'rejected']),
      allowNull: false,
      defaultValue: 'pending',
    },
  }, {
    tableName: 'partnerships',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['status'] },
      { fields: ['abilityForPartnership'] },
    ],
  });

  return Partnership;
};