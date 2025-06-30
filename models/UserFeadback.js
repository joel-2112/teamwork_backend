// models/UserFeedback.js
export default (db, DataTypes) => {
  const UserFeedback = db.define('UserFeedback', {
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
    feedbackType: {
      type: DataTypes.ENUM(['suggestion', 'complaint', 'praise', 'bug_report']),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 1000],
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    status: {
      type: DataTypes.ENUM(['pending', 'reviewed', 'resolved', 'closed']),
      allowNull: false,
      defaultValue: 'pending',
    },
  }, {
    tableName: 'user_feedbacks',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['feedbackType'] },
      { fields: ['status'] },
    ],
  });

  return UserFeedback;
};