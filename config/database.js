import { Sequelize } from 'sequelize';
import config from './config.js';

const env = process.env.NODE_ENV || 'development';

const envConfig = config[env];

const db = new Sequelize({
  database: envConfig.database,
  username: envConfig.username,
  password: String(envConfig.password),
  host: envConfig.host,
  port: envConfig.port,
  dialect: envConfig.dialect,
  logging: false,
  dialectOptions: envConfig.dialectOptions,
});

export default db;
