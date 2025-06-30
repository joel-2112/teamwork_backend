
export default (db, DataTypes) => {

const Zone = db.define('Zone', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  regionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'regions',
      key: 'id',
    },
  },
}, {
  tableName: 'zones',
  timestamps: false,
});
return Zone;
}

