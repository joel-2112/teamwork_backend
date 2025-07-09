import { DataTypes } from "sequelize";
import db from "../config/database.js";
export default (db, DataTypes) => {
  const News = db.define(
    "News",
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
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      publishDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      category: {
        type: DataTypes.ENUM([
          "technology",
          "company-news",
          "industry-updates",
          "press-releases",
          "events",
          "product-updates",
          "company-culture",
          "awards-recognition",
        ]),
        allowNull: false,
      },
      author: {
        type: DataTypes.ENUM(["teamwork", "others"]),
        allowNull: false,
      },
      readTime: {
        type: DataTypes.INTEGER, 
        allowNull: false,
      },
    },
    {
      tableName: "news",
      timestamps: true,
    }
  );
  return News;
};
