export default (sequelize, DataTypes) => {
  const Image = sequelize.define(
    "Image",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "events",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      // serviceId: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      //   references: {
      //     model: "services",
      //     key: "id",
      //   },
      //   onDelete: "CASCADE",
      // },
    },
    {
      tableName: "images",
      timestamps: true,
    }
  );

  return Image;
};
