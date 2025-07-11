export default (db, DataTypes) => {
  const Region = db.define(
    "Region",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "regions",
      timestamps: false,
    }
  );
  return Region;
};
