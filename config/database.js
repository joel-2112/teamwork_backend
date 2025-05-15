
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_RENDER_URL, {
  dialect: 'postgres', 
  dialectOptions: {
    ssl: {
      require: true, 
      rejectUnauthorized: false, 
    },
  },
  pool: {
    max: 5, 
    min: 0,
    acquire: 30000, 
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false, 
});


module.exports = sequelize;