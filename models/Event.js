import { DataTypes } from 'sequelize';
import db from '../config/database.js';

export default (db, DataTypes) => {
  const Event = db.define(
    'Event',
    {
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
      eventDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'events',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['title', 'location', 'eventDate'],
        },
      ],
    }
  );

  return Event;
};
