
module.exports = (db, DataTypes) => {

const Woreda = db.define('Woreda', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  zoneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'zones',
      key: 'id',
    },
  },
}, {
  tableName: 'woredas',
  timestamps: false,
});
return Woreda;
}

