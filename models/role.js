// models/Role.js
export default (db, DataTypes) => {
  const Role = db.define('Role', {
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
     name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'roles',
    timestamps: true,
  });

  return Role;
};
