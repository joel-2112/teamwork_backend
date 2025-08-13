// models/CustomerOrder.js
export default (db, DataTypes) => {
  const CustomerOrder = db.define(
    "CustomerOrder",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      regionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "regions",
          key: "id",
        },
      },
      zoneId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "zones",
          key: "id",
        },
      },
      woredaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "woredas",
          key: "id",
        },
      },
      manualRegion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      manualZone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      manualWoreda: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sector: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      orderTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 100],
        },
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      sex: {
        type: DataTypes.ENUM(["male", "female", "other"]),
        allowNull: false,
      },
      roleInSector: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phoneNumber1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shortDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [10, 5000],
        },
      },
      requirementFile: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM([
          "pending",
          "reviewed",
          "accepted",
          "rejected",
          "in_progress",
          "completed",
          "cancelled",
        ]),
        allowNull: false,
        defaultValue: "pending",
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deletedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "customer_orders",
      timestamps: true,
    }
  );

  return CustomerOrder;
};
